import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
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

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    updateStudentScore: (state, action: PayloadAction<{ studentId: number; change: number }>) => {
      const { studentId, change } = action.payload;
      const student = state.students.find(s => s.id === studentId);
      if (student && student.id && !student.isGuest) { // Only update scores for enrolled students with IDs
        student.score = Math.max(0, Math.min(100, student.score + change));
      }
    },
    clearStudents: (state) => {
      state.students = [];
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    updateStudents: (state, action: PayloadAction<Student[]>) => {
      // Preserve existing scores when updating students from WebSocket
      const existingScoresMap = new Map(
        state.students.filter(s => s.id).map(student => [student.id!, student.score])
      );
      state.students = action.payload.map(student => ({
        ...student,
        score: student.id ? (existingScoresMap.get(student.id) ?? 0) : 0, // Preserve existing scores for enrolled students
        isGuest: !student.id // Students without IDs are guests
      }));
      state.enrolledCount = action.payload.length;
    },
    clearAllScores: (state) => {
      // Reset all student scores to 0
      state.students.forEach(student => {
        if (!student.isGuest) {
          student.score = 0;
        }
      });
    },
    resetAllSeats: (state) => {
      // Clear all students and reset to initial guest state
      state.students = [];
      state.enrolledCount = 0;
      state.availableSlots = state.totalCapacity;
    },
  },
});

export const { updateStudentScore, clearStudents, setError, updateStudents, clearAllScores, resetAllSeats } = studentSlice.actions;
export default studentSlice.reducer;