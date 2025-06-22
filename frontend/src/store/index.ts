import { configureStore } from '@reduxjs/toolkit';
import classReducer from './slices/classSlice';
import studentReducer from './slices/studentSlice';

export const store = configureStore({
  reducer: {
    class: classReducer,
    student: studentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;