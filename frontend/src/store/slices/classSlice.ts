import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import type { ClassWithSeatMap, ClassSeatMap } from '../../types/class';

export interface ClassesState {
  classes: { [classId: string]: ClassWithSeatMap };
  currentClassId: string | null;
  joinLinks: { [classId: string]: string };
  loading: boolean;
  error: string | null;
}

const initialState: ClassesState = {
  classes: {},
  currentClassId: null,
  joinLinks: {},
  loading: false,
  error: null,
};

// Helper function to create default seat map
const createDefaultSeatMap = (capacity: number = 30): ClassSeatMap => {
  const seatMap: ClassSeatMap = {};
  for (let i = 1; i <= capacity; i++) {
    seatMap[i] = {
      studentName: '',
      isGuest: false,
      isEmpty: true,
      score: 0,
    };
  }
  return seatMap;
};

// Removed studentsToSeatMap - no longer needed since we don't fetch students from API

// Optimized helper function to assign seat number with early exit
const assignSeatNumber = (preferredSeatNumber: number | null, seatMap: ClassSeatMap, totalCapacity: number): number => {
  // If preferred seat is available (truly empty, not occupied by guest or enrolled student), use it
  if (preferredSeatNumber && 
      preferredSeatNumber > 0 && 
      preferredSeatNumber <= totalCapacity && 
      seatMap[preferredSeatNumber]?.isEmpty) {
    return preferredSeatNumber;
  }
  
  // If preferred seat is occupied (guest or enrolled student) or invalid, 
  // find lowest available seat number in ASC order (only truly empty seats)
  for (let i = 1; i <= totalCapacity; i++) {
    if (seatMap[i]?.isEmpty) {
      return i;
    }
  }
  
  // If no seats available, return 0 (should not happen in normal circumstances)
  return 0;
};

// Optimized helper function to recalculate available slots from seat map
const calculateAvailableSlots = (seatMap: ClassSeatMap, totalCapacity: number): number => {
  let emptyCount = 0;
  for (let i = 1; i <= totalCapacity; i++) {
    if (seatMap[i]?.isEmpty) {
      emptyCount++;
    }
  }
  return emptyCount;
};

// Optimized helper to find student seat without nested loops
const findStudentSeat = (seatMap: ClassSeatMap, studentId: number): number | null => {
  for (let i = 1; i <= Object.keys(seatMap).length; i++) {
    if (seatMap[i]?.studentId === studentId) {
      return i;
    }
  }
  return null;
};

// Optimized helper to remove student from seat map
const removeStudentFromSeatMap = (seatMap: ClassSeatMap, studentId: number): boolean => {
  const seatNumber = findStudentSeat(seatMap, studentId);
  if (seatNumber) {
    seatMap[seatNumber] = {
      studentName: '',
      isGuest: false,
      isEmpty: true,
      score: 0,
    };
    return true;
  }
  return false;
};

export const fetchClassInfo = createAsyncThunk(
  'classes/fetchClassInfo',
  async (classId: string) => {
    const response = await apiService.getClassInfo(classId);
    if (!response.data) {
      throw new Error('Invalid response: missing class data');
    }
    return { classId, data: response.data };
  }
);

// Removed fetchClassWithStudents - we no longer fetch students from API
// All student data is managed through the seat map and websocket updates

// Removed clearClassSeatsAsync - seat clearing is now handled entirely on client side

const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    setCurrentClass: (state, action: PayloadAction<string>) => {
      state.currentClassId = action.payload;
    },
    clearCurrentClass: (state) => {
      state.currentClassId = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    syncWithInitialStudents: (state, action: PayloadAction<{ classId: string; capacity?: number; forceReset?: boolean }>) => {
      const { classId, capacity = 30, forceReset = false } = action.payload;
      if (!state.classes[classId]) {
        // Initialize class with default seat map if it doesn't exist
        state.classes[classId] = {
          publicId: classId,
          name: '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          seatMap: createDefaultSeatMap(capacity),
          totalCapacity: capacity,
          availableSlots: capacity,
          initialized: true,
        };
      } else if (!state.classes[classId].initialized || forceReset) {
        // Only reset to empty seats on first open or if explicitly forced
        state.classes[classId].seatMap = createDefaultSeatMap(capacity);
        state.classes[classId].availableSlots = capacity;
        state.classes[classId].initialized = true;
      }
      // If class exists and initialized, keep existing seat layout
    },
    removeStudentFromAllClasses: (state, action: PayloadAction<{
      studentId: number;
      excludeClassId?: string; // Optional class to exclude from the search
    }>) => {
      const { studentId, excludeClassId } = action.payload;
      
      // Search through ALL classes to find and remove this student - optimized
      Object.keys(state.classes).forEach(classId => {
        if (excludeClassId && classId === excludeClassId) {
          return; // Skip the excluded class
        }
        
        const classData = state.classes[classId];
        const wasRemoved = removeStudentFromSeatMap(classData.seatMap, studentId);
        
        // Only recalculate slots if student was actually found and removed
        if (wasRemoved) {
          classData.availableSlots = calculateAvailableSlots(classData.seatMap, classData.totalCapacity);
        }
      });
    },
    handleStudentClassChange: (state, action: PayloadAction<{
      studentId: number;
      fromClassId: string;
      toClassId: string;
    }>) => {
      const { studentId, fromClassId } = action.payload;
      
      // Remove student from their previous class - optimized
      if (state.classes[fromClassId]) {
        const fromClass = state.classes[fromClassId];
        const wasRemoved = removeStudentFromSeatMap(fromClass.seatMap, studentId);
        
        // Only recalculate if student was actually removed
        if (wasRemoved) {
          fromClass.availableSlots = calculateAvailableSlots(fromClass.seatMap, fromClass.totalCapacity);
        }
      }
    },
    updateSeatFromWebSocket: (state, action: PayloadAction<{
      classId: string;
      joiningStudent: {
        name: string;
        seatNumber: number;
        id?: number;
        preferredSeatNumber?: number;
        fromClassId?: string; // Add this to track if student is moving from another class
      };
    }>) => {
      const { classId, joiningStudent } = action.payload;
      const classData = state.classes[classId];
      
      // Check if this enrolled student is already in another class and remove them first - optimized
      if (joiningStudent.id) {
        // Search through ALL classes to find if this student is already seated somewhere
        Object.keys(state.classes).forEach(existingClassId => {
          if (existingClassId !== classId) { // Don't check the class they're joining
            const existingClass = state.classes[existingClassId];
            const wasRemoved = removeStudentFromSeatMap(existingClass.seatMap, joiningStudent.id);
            
            // Only recalculate if student was actually found and removed
            if (wasRemoved) {
              existingClass.availableSlots = calculateAvailableSlots(existingClass.seatMap, existingClass.totalCapacity);
            }
          }
        });
      }
      
      // Also handle explicit fromClassId if provided (for backward compatibility) - optimized
      if (joiningStudent.fromClassId && joiningStudent.fromClassId !== classId && joiningStudent.id) {
        if (state.classes[joiningStudent.fromClassId]) {
          const fromClass = state.classes[joiningStudent.fromClassId];
          const wasRemoved = removeStudentFromSeatMap(fromClass.seatMap, joiningStudent.id);
          
          // Only recalculate if student was actually removed
          if (wasRemoved) {
            fromClass.availableSlots = calculateAvailableSlots(fromClass.seatMap, fromClass.totalCapacity);
          }
        }
      }
      
      if (classData) {
        let assignedSeatNumber = 0;
        
        // Always assign seat using our logic to prevent overwriting occupied seats
        if (joiningStudent.id) {
          // For enrolled students, use preferred seat assignment logic
          // Use the backend's seatNumber as preferred seat if provided and > 0
          const preferredSeat = joiningStudent.seatNumber > 0 ? joiningStudent.seatNumber : joiningStudent.preferredSeatNumber;
          assignedSeatNumber = assignSeatNumber(
            preferredSeat || null,
            classData.seatMap,
            classData.totalCapacity
          );
        } else {
          // For guest users, just assign the lowest available seat (no preferred seat)
          assignedSeatNumber = assignSeatNumber(
            null, // No preferred seat for guests
            classData.seatMap,
            classData.totalCapacity
          );
        }
        
        // Only proceed if we have a valid seat number
        if (assignedSeatNumber > 0 && assignedSeatNumber <= classData.totalCapacity) {
          // Update seat with student info
          classData.seatMap[assignedSeatNumber] = {
            studentId: joiningStudent.id,
            studentName: joiningStudent.id ? joiningStudent.name : 'Guest', // Show "Guest" for guest users
            isGuest: !joiningStudent.id, // Guest if no ID
            isEmpty: false,
            score: 0,
          };
          
          // Update counts
          if (joiningStudent.id) {
            // Enrolled student
          }
          // Recalculate available slots based on actual seat map
          classData.availableSlots = calculateAvailableSlots(classData.seatMap, classData.totalCapacity);
        }
      }
    },
    clearClassSeats: (state, action: PayloadAction<string>) => {
      const classId = action.payload;
      const classData = state.classes[classId];
      
      if (classData) {
        classData.seatMap = createDefaultSeatMap(classData.totalCapacity);
        classData.availableSlots = classData.totalCapacity;
      }
    },
    updateStudentScore: (state, action: PayloadAction<{
      classId: string;
      studentId: number;
      change: number;
    }>) => {
      const { classId, studentId, change } = action.payload;
      const classData = state.classes[classId];
      
      if (classData) {
        // Find the seat with this student ID - optimized
        const seatNumber = findStudentSeat(classData.seatMap, studentId);
        if (seatNumber && !classData.seatMap[seatNumber].isGuest) {
          classData.seatMap[seatNumber].score = Math.max(0, Math.min(100, classData.seatMap[seatNumber].score + change));
        }
      }
    },
    removeStudentFromClass: (state, action: PayloadAction<{
      classId: string;
      studentId: number;
    }>) => {
      const { classId, studentId } = action.payload;
      const classData = state.classes[classId];
      
      if (classData) {
        // Find and remove student from seat map - optimized
        const wasRemoved = removeStudentFromSeatMap(classData.seatMap, studentId);
        
        // Only recalculate if student was actually removed
        if (wasRemoved) {
          classData.availableSlots = calculateAvailableSlots(classData.seatMap, classData.totalCapacity);
        }
      }
    },
    clearAllScores: (state, action: PayloadAction<string>) => {
      const classId = action.payload;
      const classData = state.classes[classId];
      
      if (classData) {
        // Optimized to avoid Object.keys iteration
        for (let i = 1; i <= classData.totalCapacity; i++) {
          const seat = classData.seatMap[i];
          if (seat && !seat.isGuest && !seat.isEmpty) {
            seat.score = 0;
          }
        }
      }
    },
    updateStudentSeatAcrossClasses: (state, action: PayloadAction<{
      studentId: number;
      studentName: string;
      fromClassId?: string;
      toClassId: string;
      preferredSeatNumber?: number;
    }>) => {
      const { studentId, studentName, fromClassId, toClassId, preferredSeatNumber } = action.payload;
      
      // Free seat from original class if specified - optimized
      if (fromClassId && state.classes[fromClassId]) {
        const fromClass = state.classes[fromClassId];
        const wasRemoved = removeStudentFromSeatMap(fromClass.seatMap, studentId);
        
        // Only recalculate if student was actually removed
        if (wasRemoved) {
          fromClass.availableSlots = calculateAvailableSlots(fromClass.seatMap, fromClass.totalCapacity);
        }
      }
      
      // Assign seat in new class using preferred seat logic
      if (state.classes[toClassId]) {
        const toClass = state.classes[toClassId];
        const assignedSeatNumber = assignSeatNumber(
          preferredSeatNumber || null,
          toClass.seatMap,
          toClass.totalCapacity
        );
        
        if (assignedSeatNumber > 0) {
          toClass.seatMap[assignedSeatNumber] = {
            studentId,
            studentName,
            isGuest: false,
            isEmpty: false,
            score: 0,
          };
          // Recalculate available slots based on actual seat map
          toClass.availableSlots = calculateAvailableSlots(toClass.seatMap, toClass.totalCapacity);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClassInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClassInfo.fulfilled, (state, action) => {
        state.loading = false;
        const { classId, data } = action.payload;
        
        // Initialize class with default seat map if not exists
        if (!state.classes[classId]) {
          state.classes[classId] = {
            ...data.class,
            seatMap: createDefaultSeatMap(30),
            totalCapacity: 30,
            availableSlots: 30,
          };
        } else {
          // Update existing class info but keep seat map
          Object.assign(state.classes[classId], data.class);
        }
        
        state.joinLinks[classId] = data.joinLink;
      })
      .addCase(fetchClassInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch class info';
      });
  },
});

export const { 
  setCurrentClass, 
  clearCurrentClass, 
  setError, 
  syncWithInitialStudents,
  removeStudentFromAllClasses,
  handleStudentClassChange,
  updateSeatFromWebSocket,
  clearClassSeats,
  updateStudentScore,
  removeStudentFromClass,
  clearAllScores,
  updateStudentSeatAcrossClasses
} = classesSlice.actions;

export default classesSlice.reducer;