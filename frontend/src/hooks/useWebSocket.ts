import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  connectStart,
  connectSuccess,
  connectError,
  disconnect,
  messageReceived,
  type WebSocketMessage,
} from '../store/slices/websocketSlice';
import { config } from '../config/env';

export const useWebSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { connection, isConnected, isConnecting, classId } = useSelector(
    (state: RootState) => state.websocket
  );

  const connect = useCallback((classId: string) => {
    dispatch(connectStart(classId));

    // Get WebSocket URL from config
    const wsUrl = config.api.getWebSocketUrl(classId);
    
    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected for class:', classId);
        dispatch(connectSuccess(ws));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          dispatch(messageReceived(message));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        dispatch(connectError('WebSocket connection failed'));
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        if (!event.wasClean) {
          dispatch(connectError('WebSocket connection lost'));
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      dispatch(connectError('Failed to create WebSocket connection'));
    }
  }, [dispatch]);

  const disconnectWebSocket = useCallback(() => {
    dispatch(disconnect());
  }, [dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connection) {
        connection.close();
      }
    };
  }, [connection]);

  return {
    connect,
    disconnect: disconnectWebSocket,
    isConnected,
    isConnecting,
    classId,
  };
};