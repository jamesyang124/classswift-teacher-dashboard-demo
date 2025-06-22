import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import type { ClassInfo } from '../../types/class';
import { fetchClassStudents } from './studentSlice';

export interface ClassState {
  classInfo: ClassInfo | null;
  joinLink: string;
  loading: boolean;
  error: string | null;
}

const initialState: ClassState = {
  classInfo: null,
  joinLink: '',
  loading: false,
  error: null,
};

export const fetchClassInfo = createAsyncThunk(
  'class/fetchClassInfo',
  async (classId: string) => {
    const response = await apiService.getClassInfo(classId);
    if (!response.data) {
      throw new Error('Invalid response: missing class data');
    }
    return response.data;
  }
);

export const fetchClassInfoAndStudents = createAsyncThunk(
  'class/fetchClassInfoAndStudents',
  async (classId: string, { dispatch }) => {
    const classResponse = await apiService.getClassInfo(classId);
    if (!classResponse.data) {
      throw new Error('Invalid response: missing class data');
    }
    dispatch(fetchClassStudents(classId));
    return classResponse.data;
  }
);

const classSlice = createSlice({
  name: 'class',
  initialState,
  reducers: {
    clearClassInfo: (state) => {
      state.classInfo = null;
      state.joinLink = '';
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
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
        state.classInfo = action.payload.class;
        state.joinLink = action.payload.joinLink;
      })
      .addCase(fetchClassInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch class info';
      })
      .addCase(fetchClassInfoAndStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClassInfoAndStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.classInfo = action.payload.class;
        state.joinLink = action.payload.joinLink;
      })
      .addCase(fetchClassInfoAndStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch class info and students';
      });
  },
});

export const { clearClassInfo, setError } = classSlice.actions;
export default classSlice.reducer;