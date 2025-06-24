import { configureStore } from '@reduxjs/toolkit';
import classesReducer from './slices/classSlice';
import websocketReducer from './slices/websocketSlice';

export const store = configureStore({
  reducer: {
    classes: classesReducer,
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