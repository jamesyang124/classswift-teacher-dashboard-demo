import { useEffect, useState, useCallback } from 'react';
import { webSocketManager, type WebSocketMessage } from '../services/webSocketManager';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(webSocketManager.isConnected());
  const [isConnecting, setIsConnecting] = useState(webSocketManager.isInConnecting());
  const [classId, setClassId] = useState(webSocketManager.getCurrentClassId());
  const [reconnectAttempts, setReconnectAttempts] = useState(webSocketManager.getReconnectAttempts());
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Connection listener
  const handleConnection = useCallback((connected: boolean) => {
    setIsConnected(connected);
    setIsConnecting(false);
    setClassId(webSocketManager.getCurrentClassId());
    setReconnectAttempts(webSocketManager.getReconnectAttempts());
  }, []);

  // Message listener
  const handleMessage = useCallback((message: WebSocketMessage) => {
    setLastMessage(message);
  }, []);

  // Error listener
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsConnecting(false);
    setReconnectAttempts(webSocketManager.getReconnectAttempts());
  }, []);

  // Connect function - now uses singleton manager
  const connect = useCallback(async (classId: string) => {
    try {
      setIsConnecting(true);
      setError(null);
      await webSocketManager.connect(classId);
      setClassId(classId);
    } catch (error) {
      console.error('Failed to connect:', error);
      setError(error instanceof Error ? error.message : 'Connection failed');
      setIsConnecting(false);
    }
  }, []);

  // Disconnect function - should only be used when explicitly leaving a class
  const disconnect = useCallback(() => {
    console.log('🔌 useWebSocket: Explicit disconnect requested');
    webSocketManager.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    setClassId(null);
    setReconnectAttempts(0);
    setError(null);
  }, []);

  // Force reconnect function
  const forceReconnect = useCallback(() => {
    const currentClassId = webSocketManager.getCurrentClassId();
    if (currentClassId) {
      console.log('🔄 Force reconnecting...');
      webSocketManager.disconnect();
      connect(currentClassId);
    }
  }, [connect]);

  // Reset reconnect attempts
  const resetReconnectAttempts = useCallback(() => {
    // WebSocketManager handles this internally
    setReconnectAttempts(0);
  }, []);

  // Setup listeners on mount
  useEffect(() => {
    webSocketManager.addConnectionListener(handleConnection);
    webSocketManager.addMessageListener(handleMessage);
    webSocketManager.addErrorListener(handleError);

    // Initial state sync
    setIsConnected(webSocketManager.isConnected());
    setIsConnecting(webSocketManager.isInConnecting());
    setClassId(webSocketManager.getCurrentClassId());
    setReconnectAttempts(webSocketManager.getReconnectAttempts());

    return () => {
      webSocketManager.removeConnectionListener(handleConnection);
      webSocketManager.removeMessageListener(handleMessage);
      webSocketManager.removeErrorListener(handleError);
    };
  }, [handleConnection, handleMessage, handleError]);

  return {
    connect,
    disconnect,
    forceReconnect,
    resetReconnectAttempts,
    isConnected,
    isConnecting,
    classId,
    reconnectAttempts,
    lastMessage,
    error,
  };
};