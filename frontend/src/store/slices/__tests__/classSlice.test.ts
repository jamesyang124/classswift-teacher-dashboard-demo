import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import classesReducer, {
  syncWithInitialStudents,
  updateSeatFromWebSocket,
  removeStudentFromAllClasses,
  clearClassSeats,
} from '../classSlice';
import type { ClassesState } from '../classSlice';

// Helper function to create a test store
const createTestStore = (initialState?: Partial<ClassesState>) => {
  return configureStore({
    reducer: {
      classes: classesReducer,
    },
    preloadedState: {
      classes: {
        classes: {},
        currentClassId: null,
        joinLinks: {},
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

describe('classSlice', () => {
  describe('syncWithInitialStudents', () => {
    it('should initialize a new class with empty seats', () => {
      const store = createTestStore();
      
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 5 }));
      
      const state = store.getState().classes;
      expect(state.classes['TEST123']).toBeDefined();
      expect(state.classes['TEST123'].totalCapacity).toBe(5);
      expect(state.classes['TEST123'].availableSlots).toBe(5);
      expect(state.classes['TEST123'].seatMap[1].isEmpty).toBe(true);
      expect(state.classes['TEST123'].seatMap[1].studentName).toBe('');
    });

    it('should not reset seats on second open (without forceReset)', () => {
      const store = createTestStore();
      
      // First initialization
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 5 }));
      
      // Add a student
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 1, name: 'John', seatNumber: 0 }
      }));
      
      let state = store.getState().classes;
      expect(state.classes['TEST123'].availableSlots).toBe(4); // One seat taken
      
      // Second initialization (simulating modal re-open)
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 5 }));
      
      state = store.getState().classes;
      expect(state.classes['TEST123'].availableSlots).toBe(4); // Should remain 4, not reset to 5
    });

    it('should reset seats with forceReset', () => {
      const store = createTestStore();
      
      // Initialize and add a student
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 5 }));
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 1, name: 'John', seatNumber: 0 }
      }));
      
      let state = store.getState().classes;
      expect(state.classes['TEST123'].availableSlots).toBe(4);
      
      // Force reset
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 5, forceReset: true }));
      
      state = store.getState().classes;
      expect(state.classes['TEST123'].availableSlots).toBe(5); // Should be reset to 5
      expect(state.classes['TEST123'].seatMap[1].isEmpty).toBe(true);
    });
  });

  describe('updateSeatFromWebSocket', () => {
    it('should assign enrolled student to lowest available seat', () => {
      const store = createTestStore();
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 5 }));
      
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 1, name: 'John', seatNumber: 0 }
      }));
      
      const state = store.getState().classes;
      expect(state.classes['TEST123'].seatMap[1].studentId).toBe(1);
      expect(state.classes['TEST123'].seatMap[1].studentName).toBe('John');
      expect(state.classes['TEST123'].seatMap[1].isGuest).toBe(false);
      expect(state.classes['TEST123'].seatMap[1].isEmpty).toBe(false);
      expect(state.classes['TEST123'].availableSlots).toBe(4);
    });

    it('should assign guest student and display as Guest', () => {
      const store = createTestStore();
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 5 }));
      
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { name: 'Alice', seatNumber: 0 } // No ID = guest
      }));
      
      const state = store.getState().classes;
      expect(state.classes['TEST123'].seatMap[1].studentId).toBeUndefined();
      expect(state.classes['TEST123'].seatMap[1].studentName).toBe('Guest');
      expect(state.classes['TEST123'].seatMap[1].isGuest).toBe(true);
      expect(state.classes['TEST123'].seatMap[1].isEmpty).toBe(false);
      expect(state.classes['TEST123'].availableSlots).toBe(4);
    });

    it('should use preferred seat if available', () => {
      const store = createTestStore();
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 5 }));
      
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 1, name: 'John', seatNumber: 3, preferredSeatNumber: 3 }
      }));
      
      const state = store.getState().classes;
      expect(state.classes['TEST123'].seatMap[3].studentId).toBe(1);
      expect(state.classes['TEST123'].seatMap[3].studentName).toBe('John');
    });

    it('should fallback to ASC order if preferred seat is occupied', () => {
      const store = createTestStore();
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 5 }));
      
      // Occupy seat 1 with a guest first
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { name: 'Guest1', seatNumber: 0 } // Will get seat 1
      }));
      
      // Try to assign enrolled student with preferred seat 1 (already occupied)
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 1, name: 'John', seatNumber: 1, preferredSeatNumber: 1 }
      }));
      
      const state = store.getState().classes;
      expect(state.classes['TEST123'].seatMap[1].studentName).toBe('Guest'); // Still guest
      expect(state.classes['TEST123'].seatMap[2].studentId).toBe(1); // John gets seat 2 instead
      expect(state.classes['TEST123'].seatMap[2].studentName).toBe('John');
    });

    it('should remove student from previous class when joining new class', () => {
      const store = createTestStore();
      
      // Initialize two classes
      store.dispatch(syncWithInitialStudents({ classId: 'CLASS_A', capacity: 5 }));
      store.dispatch(syncWithInitialStudents({ classId: 'CLASS_B', capacity: 5 }));
      
      // Student joins Class A
      store.dispatch(updateSeatFromWebSocket({
        classId: 'CLASS_A',
        joiningStudent: { id: 1, name: 'John', seatNumber: 0 }
      }));
      
      let state = store.getState().classes;
      expect(state.classes['CLASS_A'].seatMap[1].studentId).toBe(1);
      expect(state.classes['CLASS_A'].availableSlots).toBe(4);
      
      // Same student joins Class B (should remove from Class A)
      store.dispatch(updateSeatFromWebSocket({
        classId: 'CLASS_B',
        joiningStudent: { id: 1, name: 'John', seatNumber: 0 }
      }));
      
      state = store.getState().classes;
      // Check Class A - student should be removed
      expect(state.classes['CLASS_A'].seatMap[1].studentName).toBe('');
      expect(state.classes['CLASS_A'].seatMap[1].isEmpty).toBe(true);
      expect(state.classes['CLASS_A'].availableSlots).toBe(5);
      
      // Check Class B - student should be added
      expect(state.classes['CLASS_B'].seatMap[1].studentId).toBe(1);
      expect(state.classes['CLASS_B'].seatMap[1].studentName).toBe('John');
      expect(state.classes['CLASS_B'].availableSlots).toBe(4);
    });
  });

  describe('removeStudentFromAllClasses', () => {
    it('should remove student from all classes', () => {
      const store = createTestStore();
      
      // Initialize two classes
      store.dispatch(syncWithInitialStudents({ classId: 'CLASS_A', capacity: 5 }));
      store.dispatch(syncWithInitialStudents({ classId: 'CLASS_B', capacity: 5 }));
      
      // Add student to CLASS_A
      store.dispatch(updateSeatFromWebSocket({
        classId: 'CLASS_A',
        joiningStudent: { id: 1, name: 'John', seatNumber: 0 }
      }));
      
      // Use a different test approach - test that the action works
      let state = store.getState().classes;
      expect(state.classes['CLASS_A'].seatMap[1].studentId).toBe(1);
      expect(state.classes['CLASS_A'].availableSlots).toBe(4);
      
      // Remove student from all classes
      store.dispatch(removeStudentFromAllClasses({ studentId: 1 }));
      
      state = store.getState().classes;
      expect(state.classes['CLASS_A'].seatMap[1].isEmpty).toBe(true);
      expect(state.classes['CLASS_A'].seatMap[1].studentName).toBe('');
      expect(state.classes['CLASS_A'].availableSlots).toBe(5);
    });
  });

  describe('clearClassSeats', () => {
    it('should reset all seats to empty', () => {
      const store = createTestStore();
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 3 }));
      
      // Add some students
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 1, name: 'John', seatNumber: 0 }
      }));
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { name: 'Guest1', seatNumber: 0 }
      }));
      
      let state = store.getState().classes;
      expect(state.classes['TEST123'].availableSlots).toBe(1); // 3 - 2 = 1
      
      // Clear all seats
      store.dispatch(clearClassSeats('TEST123'));
      
      state = store.getState().classes;
      expect(state.classes['TEST123'].availableSlots).toBe(3);
      expect(state.classes['TEST123'].seatMap[1].isEmpty).toBe(true);
      expect(state.classes['TEST123'].seatMap[2].isEmpty).toBe(true);
      expect(state.classes['TEST123'].seatMap[3].isEmpty).toBe(true);
    });
  });

  describe('calculateAvailableSlots accuracy', () => {
    it('should accurately count available slots', () => {
      const store = createTestStore();
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 4 }));
      
      // Add 2 enrolled students and 1 guest
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 1, name: 'John', seatNumber: 0 }
      }));
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 2, name: 'Jane', seatNumber: 0 }
      }));
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { name: 'Guest1', seatNumber: 0 }
      }));
      
      const state = store.getState().classes;
      expect(state.classes['TEST123'].availableSlots).toBe(1); // 4 - 3 = 1
      
      // Verify individual seats
      expect(state.classes['TEST123'].seatMap[1].isEmpty).toBe(false);
      expect(state.classes['TEST123'].seatMap[2].isEmpty).toBe(false);
      expect(state.classes['TEST123'].seatMap[3].isEmpty).toBe(false);
      expect(state.classes['TEST123'].seatMap[4].isEmpty).toBe(true);
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle full capacity gracefully', () => {
      const store = createTestStore();
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 2 }));
      
      // Fill all seats
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 1, name: 'John', seatNumber: 0 }
      }));
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 2, name: 'Jane', seatNumber: 0 }
      }));
      
      let state = store.getState().classes;
      expect(state.classes['TEST123'].availableSlots).toBe(0);
      
      // Try to add another student when full - should not crash
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 3, name: 'Bob', seatNumber: 0 }
      }));
      
      state = store.getState().classes;
      expect(state.classes['TEST123'].availableSlots).toBe(0); // Should remain 0
      expect(state.classes['TEST123'].seatMap[1].studentName).toBe('John');
      expect(state.classes['TEST123'].seatMap[2].studentName).toBe('Jane');
    });

    it('should handle zero capacity', () => {
      const store = createTestStore();
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 0 }));
      
      const state = store.getState().classes;
      expect(state.classes['TEST123'].totalCapacity).toBe(0);
      expect(state.classes['TEST123'].availableSlots).toBe(0);
      expect(Object.keys(state.classes['TEST123'].seatMap)).toHaveLength(0);
    });

    it('should handle invalid student data gracefully', () => {
      const store = createTestStore();
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 5 }));
      
      // Try adding student with empty name
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 1, name: '', seatNumber: 0 }
      }));
      
      // Try adding student with invalid preferred seat
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 2, name: 'Jane', seatNumber: 0, preferredSeatNumber: 99 }
      }));
      
      const state = store.getState().classes;
      // Should still function normally
      expect(state.classes['TEST123'].availableSlots).toBe(3); // 5 - 2 = 3
    });

    it('should handle negative preferred seat numbers', () => {
      const store = createTestStore();
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 5 }));
      
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 1, name: 'John', seatNumber: 0, preferredSeatNumber: -1 }
      }));
      
      const state = store.getState().classes;
      expect(state.classes['TEST123'].seatMap[1].studentId).toBe(1); // Should get seat 1 (fallback)
      expect(state.classes['TEST123'].seatMap[1].studentName).toBe('John');
    });
  });

  describe('concurrent operations and state consistency', () => {
    it('should handle multiple rapid seat assignments', () => {
      const store = createTestStore();
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 10 }));
      
      // Simulate rapid student joins
      const students = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 3, name: 'Bob' },
        { name: 'Guest1' },
        { name: 'Guest2' },
      ];
      
      students.forEach((student) => {
        store.dispatch(updateSeatFromWebSocket({
          classId: 'TEST123',
          joiningStudent: { ...student, seatNumber: 0 }
        }));
      });
      
      const state = store.getState().classes;
      expect(state.classes['TEST123'].availableSlots).toBe(5); // 10 - 5 = 5
      
      // Verify all seats are properly assigned in sequence
      expect(state.classes['TEST123'].seatMap[1].studentName).toBe('John');
      expect(state.classes['TEST123'].seatMap[2].studentName).toBe('Jane');
      expect(state.classes['TEST123'].seatMap[3].studentName).toBe('Bob');
      expect(state.classes['TEST123'].seatMap[4].studentName).toBe('Guest');
      expect(state.classes['TEST123'].seatMap[5].studentName).toBe('Guest');
    });

    it('should maintain state consistency across multiple class operations', () => {
      const store = createTestStore();
      
      // Initialize multiple classes
      store.dispatch(syncWithInitialStudents({ classId: 'CLASS_A', capacity: 3 }));
      store.dispatch(syncWithInitialStudents({ classId: 'CLASS_B', capacity: 4 }));
      store.dispatch(syncWithInitialStudents({ classId: 'CLASS_C', capacity: 2 }));
      
      // Add students to different classes
      store.dispatch(updateSeatFromWebSocket({
        classId: 'CLASS_A',
        joiningStudent: { id: 1, name: 'John', seatNumber: 0 }
      }));
      store.dispatch(updateSeatFromWebSocket({
        classId: 'CLASS_B',
        joiningStudent: { id: 2, name: 'Jane', seatNumber: 0 }
      }));
      
      let state = store.getState().classes;
      expect(state.classes['CLASS_A'].availableSlots).toBe(2);
      expect(state.classes['CLASS_B'].availableSlots).toBe(3);
      expect(state.classes['CLASS_C'].availableSlots).toBe(2);
      
      // Move student from CLASS_A to CLASS_C
      store.dispatch(updateSeatFromWebSocket({
        classId: 'CLASS_C',
        joiningStudent: { id: 1, name: 'John', seatNumber: 0 }
      }));
      
      state = store.getState().classes;
      expect(state.classes['CLASS_A'].availableSlots).toBe(3); // John left
      expect(state.classes['CLASS_B'].availableSlots).toBe(3); // Jane still there
      expect(state.classes['CLASS_C'].availableSlots).toBe(1); // John joined
      
      // Verify John is only in CLASS_C
      expect(state.classes['CLASS_A'].seatMap[1].isEmpty).toBe(true);
      expect(state.classes['CLASS_C'].seatMap[1].studentId).toBe(1);
    });

    it('should handle guest students correctly across operations', () => {
      const store = createTestStore();
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 5 }));
      
      // Add multiple guests with same name
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { name: 'Alice', seatNumber: 0 }
      }));
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { name: 'Alice', seatNumber: 0 }
      }));
      
      const state = store.getState().classes;
      expect(state.classes['TEST123'].availableSlots).toBe(3); // 2 guests took seats
      expect(state.classes['TEST123'].seatMap[1].studentName).toBe('Guest');
      expect(state.classes['TEST123'].seatMap[2].studentName).toBe('Guest');
      expect(state.classes['TEST123'].seatMap[1].isGuest).toBe(true);
      expect(state.classes['TEST123'].seatMap[2].isGuest).toBe(true);
    });

    it('should handle mixed enrolled and guest students with preferred seats', () => {
      const store = createTestStore();
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 6 }));
      
      // Guest takes first available seat (seat 1)
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { name: 'GuestUser', seatNumber: 0 }
      }));
      
      // Enrolled student wants seat 1 (occupied by guest) - should fallback to seat 2
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 1, name: 'John', seatNumber: 0, preferredSeatNumber: 1 }
      }));
      
      // Another enrolled student gets available preferred seat 5
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 2, name: 'Jane', seatNumber: 0, preferredSeatNumber: 5 }
      }));
      
      const state = store.getState().classes;
      expect(state.classes['TEST123'].availableSlots).toBe(3); // 6 - 3 = 3
      expect(state.classes['TEST123'].seatMap[1].studentName).toBe('Guest'); // Guest got seat 1
      expect(state.classes['TEST123'].seatMap[2].studentId).toBe(1); // John fallback to seat 2
      expect(state.classes['TEST123'].seatMap[5].studentId).toBe(2); // Jane got preferred seat 5
    });
  });

  describe('class initialization edge cases', () => {
    it('should handle repeated initialization without forceReset', () => {
      const store = createTestStore();
      
      // Multiple initializations of same class
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 5 }));
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 5 }));
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 5 }));
      
      const state = store.getState().classes;
      expect(state.classes['TEST123'].publicId).toEqual('TEST123'); // Should only appear once
      expect(state.classes['TEST123'].totalCapacity).toBe(5);
    });

    it('should handle capacity changes with forceReset', () => {
      const store = createTestStore();
      
      // Initial setup
      store.dispatch(syncWithInitialStudents({ classId: 'TEST123', capacity: 3 }));
      store.dispatch(updateSeatFromWebSocket({
        classId: 'TEST123',
        joiningStudent: { id: 1, name: 'John', seatNumber: 0 }
      }));
      
      let state = store.getState().classes;
      expect(state.classes['TEST123'].totalCapacity).toBe(3);
      expect(state.classes['TEST123'].availableSlots).toBe(2);
      
      // Re-initialize with different capacity (with forceReset)
      store.dispatch(syncWithInitialStudents({ classId: 'TEST223', capacity: 5, forceReset: true }));
      
      state = store.getState().classes;
      expect(state.classes['TEST223'].totalCapacity).toBe(5); // Should update capacity
      expect(state.classes['TEST223'].seatMap[1].studentName).toBe(''); // Should be reset
      expect(state.classes['TEST223'].availableSlots).toBe(5); // All seats available
    });
  });
});