import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface WebSocketMessage {
  type: string;
  classId: string;
  data: any;
  timestamp: string;
}

export interface WebSocketState {
  connection: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  lastMessage: WebSocketMessage | null;
  error: string | null;
  classId: string | null;
  reconnectAttempts: number;
  lastHeartbeat: number | null;
  shouldReconnect: boolean;
}

const initialState: WebSocketState = {
  connection: null,
  isConnected: false,
  isConnecting: false,
  lastMessage: null,
  error: null,
  classId: null,
  reconnectAttempts: 0,
  lastHeartbeat: null,
  shouldReconnect: true,
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    connectStart: (state, action: PayloadAction<string>) => {
      // Prevent multiple connections
      if (state.isConnected || state.isConnecting) {
        return;
      }
      state.isConnecting = true;
      state.error = null;
      state.classId = action.payload;
    },
    connectSuccess: (state, action: PayloadAction<WebSocket>) => {
      state.connection = action.payload;
      state.isConnected = true;
      state.isConnecting = false;
      state.error = null;
      state.reconnectAttempts = 0;
      state.lastHeartbeat = Date.now();
    },
    connectError: (state, action: PayloadAction<string>) => {
      state.connection = null;
      state.isConnected = false;
      state.isConnecting = false;
      state.error = action.payload;
      state.reconnectAttempts += 1;
    },
    disconnect: (state) => {
      state.shouldReconnect = false;
      if (state.connection) {
        state.connection.close();
      }
      state.connection = null;
      state.isConnected = false;
      state.isConnecting = false;
      state.classId = null;
      state.error = null;
      state.reconnectAttempts = 0;
      state.lastHeartbeat = null;
    },
    heartbeatReceived: (state) => {
      state.lastHeartbeat = Date.now();
    },
    resetReconnectAttempts: (state) => {
      state.reconnectAttempts = 0;
    },
    messageReceived: (state, action: PayloadAction<WebSocketMessage>) => {
      state.lastMessage = action.payload;
    },
    clearLastMessage: (state) => {
      state.lastMessage = null;
    },
  },
});

export const {
  connectStart,
  connectSuccess,
  connectError,
  disconnect,
  messageReceived,
  clearLastMessage,
  heartbeatReceived,
  resetReconnectAttempts,
} = websocketSlice.actions;

export default websocketSlice.reducer;