import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import type { Student } from '../../types/student';

export interface StudentState {
  students: Student[];
  totalCapacity: number;
  enrolledCount: number;
  availableSlots: number;
  loading: boolean;
  error: string | null;
}

const initialState: StudentState = {
  students: [],
  totalCapacity: 0,
  enrolledCount: 0,
  availableSlots: 0,
  loading: false,
  error: null,
};

export const fetchClassStudents = createAsyncThunk(
  'student/fetchClassStudents',
  async (classId: string) => {
    const response = await apiService.getClassStudents(classId);
    if (!response.data || !response.data.students) {
      throw new Error('Invalid response: missing student data');
    }
    
    // Transform backend students to frontend students with points and isGuest
    const students = response.data.students.map(student => ({
      ...student,
      points: 0, // Initialize points to 0
      isGuest: false // All enrolled students are not guests
    }));
    
    return {
      students,
      totalCapacity: response.data.totalCapacity,
      enrolledCount: response.data.enrolledCount,
      availableSlots: response.data.availableSlots
    };
  }
);

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    updateStudentPoints: (state, action: PayloadAction<{ studentId: number; change: number }>) => {
      const { studentId, change } = action.payload;
      const student = state.students.find(s => s.id === studentId);
      if (student && !student.isGuest) {
        student.points = Math.max(0, student.points + change);
      }
    },
    clearStudents: (state) => {
      state.students = [];
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    updateClassCapacity: (state, action: PayloadAction<{
      totalCapacity: number;
      enrolledCount: number;
      availableSlots: number;
    }>) => {
      state.totalCapacity = action.payload.totalCapacity;
      state.enrolledCount = action.payload.enrolledCount;
      state.availableSlots = action.payload.availableSlots;
    },
    updateStudents: (state, action: PayloadAction<Student[]>) => {
      // Preserve existing points when updating students from WebSocket
      const existingPointsMap = new Map(
        state.students.map(student => [student.id, student.points])
      );
      
      state.students = action.payload.map(student => ({
        ...student,
        points: existingPointsMap.get(student.id) ?? 0, // Preserve existing points or default to 0
        isGuest: false // All enrolled students are not guests
      }));
      state.enrolledCount = action.payload.length;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClassStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClassStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.students;
        state.totalCapacity = action.payload.totalCapacity;
        state.enrolledCount = action.payload.enrolledCount;
        state.availableSlots = action.payload.availableSlots;
      })
      .addCase(fetchClassStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch class students';
      });
  },
});

export const { updateStudentPoints, clearStudents, setError, updateClassCapacity, updateStudents } = studentSlice.actions;
export default studentSlice.reducer;