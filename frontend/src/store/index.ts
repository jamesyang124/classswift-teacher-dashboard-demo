import { configureStore } from '@reduxjs/toolkit';
import classReducer from './slices/classSlice';
import studentReducer from './slices/studentSlice';
import websocketReducer from './slices/websocketSlice';

export const store = configureStore({
  reducer: {
    class: classReducer,
    student: studentReducer,
    websocket: websocketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['websocket/connectSuccess'],
        ignoredPaths: ['websocket.connection'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;