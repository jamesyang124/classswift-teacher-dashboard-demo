/**
 * Singleton WebSocket Manager
 * Ensures only ONE WebSocket connection per device/browser tab
 */

import { config } from '../config/env';

export interface WebSocketMessage {
  type: string;
  classId: string;
  data: any;
  timestamp: string;
}

type WebSocketListener = (message: WebSocketMessage) => void;
type ConnectionListener = (connected: boolean) => void;
type ErrorListener = (error: string) => void;

class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private currentClassId: string | null = null;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private shouldReconnect: boolean = true;
  private connectionId: number = 0; // Track connection attempts
  
  // Listeners
  private messageListeners: Set<WebSocketListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();
  private errorListeners: Set<ErrorListener> = new Set();
  
  // Timers
  private heartbeatInterval: number | null = null;
  private heartbeatTimeout: number | null = null;
  private reconnectTimeout: number | null = null;
  
  // Constants
  private readonly HEARTBEAT_INTERVAL = 10000; // 10 seconds
  private readonly HEARTBEAT_TIMEOUT = 5000; // 5 seconds
  private readonly MAX_RECONNECT_ATTEMPTS = 10; // Increased for better reliability
  private readonly RECONNECT_DELAY_BASE = 1000; // 1 second base delay
  private readonly MAX_RECONNECT_DELAY = 15000; // Maximum 15 seconds delay

  private constructor() {
    // Singleton pattern - private constructor
    this.shouldReconnect = true; // Enable auto-reconnect by default
    console.log('🔧 WebSocketManager initialized with auto-reconnect enabled');
  }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public connect(classId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`🔌 WebSocket connect requested for class: ${classId}`);
      
      // If already connected to the same class, resolve immediately
      if (this.isConnected() && this.currentClassId === classId) {
        console.log('♻️ WebSocket already connected to class:', classId);
        resolve();
        return;
      }

      // If connecting to different class, close existing connection
      if (this.ws && this.currentClassId !== classId) {
        console.log('🔄 Switching from class', this.currentClassId, 'to', classId);
        this.disconnect();
      }

      // If already connecting, wait for current connection
      if (this.isConnecting) {
        console.log('⏳ Already connecting, waiting...');
        // Wait for connection to complete
        const checkConnection = () => {
          if (this.isConnected() && this.currentClassId === classId) {
            resolve();
          } else if (!this.isConnecting) {
            reject(new Error('Connection failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      // Check if we have a websocket in CONNECTING state
      if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
        console.log('🔄 WebSocket is connecting, waiting for it to open or fail...');
        const waitForConnection = () => {
          if (!this.ws) {
            reject(new Error('WebSocket was cleared during connection'));
            return;
          }
          if (this.ws.readyState === WebSocket.OPEN) {
            console.log('✅ WebSocket connection completed');
            this.isConnecting = false;
            resolve();
          } else if (this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING) {
            reject(new Error('WebSocket closed during connection'));
          } else {
            setTimeout(waitForConnection, 50);
          }
        };
        waitForConnection();
        return;
      }

      this.currentClassId = classId;
      this.isConnecting = true;
      this.connectionId++; // Increment connection ID for this attempt
      
      const wsUrl = config.api.getWebSocketUrl(classId);
      const currentConnectionId = this.connectionId;
      console.log(`🔌 Creating WebSocket connection to: ${wsUrl} (ID: ${currentConnectionId})`);
      
      try {
        this.ws = new WebSocket(wsUrl);
        
        // Store reference to avoid closure issues
        const currentWs = this.ws;
        
        currentWs.onopen = () => {
          // Verify this is still the current WebSocket and connection
          if (this.ws !== currentWs || this.connectionId !== currentConnectionId) {
            console.log(`🚫 WebSocket opened but it's no longer current (ID: ${currentConnectionId} vs ${this.connectionId}), closing...`);
            currentWs.close();
            return;
          }
          
          console.log(`✅ WebSocket connected to class: ${classId} (ID: ${currentConnectionId})`);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.notifyConnectionListeners(true);
          resolve();
        };

        currentWs.onmessage = (event) => {
          // Verify this is still the current WebSocket and connection
          if (this.ws !== currentWs || this.connectionId !== currentConnectionId) {
            console.log(`🚫 Message received from old WebSocket (ID: ${currentConnectionId}), ignoring...`);
            return;
          }
          
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            
            // Handle pong response
            if (message.type === 'pong') {
              console.log('💓 Received WebSocket pong');
              this.clearHeartbeatTimeout();
              return;
            }
            
            console.log('📩 WebSocket message received:', message);
            this.notifyMessageListeners(message);
          } catch (error) {
            console.error('❌ Failed to parse WebSocket message:', error);
          }
        };

        currentWs.onerror = (error) => {
          // Only handle error if this is still the current WebSocket and connection
          if (this.ws !== currentWs || this.connectionId !== currentConnectionId) {
            console.log(`🚫 Error from old WebSocket (ID: ${currentConnectionId}), ignoring...`);
            return;
          }
          
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          this.clearTimers();
          this.notifyErrorListeners('WebSocket connection failed');
          reject(error);
        };

        currentWs.onclose = (event) => {
          // Only handle close if this is still the current WebSocket and connection
          if (this.ws !== currentWs || this.connectionId !== currentConnectionId) {
            console.log(`🚫 Close event from old WebSocket (ID: ${currentConnectionId}), ignoring...`);
            return;
          }
          
          console.log(`🔌 WebSocket disconnected: ${event.code} ${event.reason}`);
          this.isConnecting = false;
          this.clearTimers();
          this.notifyConnectionListeners(false);
          
          // Auto-reconnect for all unintentional disconnects (expanded conditions)
          const shouldAutoReconnect = this.shouldReconnect && 
            (event.code !== 1000 || !event.wasClean) && // Not a clean close
            event.code !== 1001 && // Not going away
            this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS;
            
          if (shouldAutoReconnect) {
            console.log(`🔄 Auto-reconnecting due to code ${event.code} (attempt ${this.reconnectAttempts + 1}/${this.MAX_RECONNECT_ATTEMPTS})`);
            this.attemptReconnect();
          } else if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            console.log('❌ Max reconnection attempts reached, giving up');
            this.notifyErrorListeners('Max reconnection attempts reached');
          } else {
            console.log('✋ Clean disconnect, not reconnecting');
          }
        };

      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error);
        this.isConnecting = false;
        this.notifyErrorListeners('Failed to create WebSocket connection');
        reject(error);
      }
    });
  }

  public disconnect(): void {
    console.log('🔌 Disconnecting WebSocket');
    this.shouldReconnect = false;
    this.clearTimers();
    
    if (this.ws) {
      // Only close if not already closed or closing
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnect');
      }
      this.ws = null;
    }
    
    this.currentClassId = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.notifyConnectionListeners(false);
  }

  public enableReconnect(): void {
    console.log('✅ Auto-reconnect enabled');
    this.shouldReconnect = true;
  }

  public disableReconnect(): void {
    console.log('⏹️ Auto-reconnect disabled');
    this.shouldReconnect = false;
  }

  public resetReconnectAttempts(): void {
    console.log('🔄 Resetting reconnect attempts');
    this.reconnectAttempts = 0;
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public isInConnecting(): boolean {
    return this.isConnecting;
  }

  public getCurrentClassId(): string | null {
    return this.currentClassId;
  }

  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  public getConnectionStatus(): {
    isConnected: boolean;
    isConnecting: boolean;
    classId: string | null;
    reconnectAttempts: number;
    shouldReconnect: boolean;
    maxReconnectAttempts: number;
  } {
    return {
      isConnected: this.isConnected(),
      isConnecting: this.isConnecting,
      classId: this.currentClassId,
      reconnectAttempts: this.reconnectAttempts,
      shouldReconnect: this.shouldReconnect,
      maxReconnectAttempts: this.MAX_RECONNECT_ATTEMPTS,
    };
  }

  // Listener management
  public addMessageListener(listener: WebSocketListener): void {
    this.messageListeners.add(listener);
  }

  public removeMessageListener(listener: WebSocketListener): void {
    this.messageListeners.delete(listener);
  }

  public addConnectionListener(listener: ConnectionListener): void {
    this.connectionListeners.add(listener);
  }

  public removeConnectionListener(listener: ConnectionListener): void {
    this.connectionListeners.delete(listener);
  }

  public addErrorListener(listener: ErrorListener): void {
    this.errorListeners.add(listener);
  }

  public removeErrorListener(listener: ErrorListener): void {
    this.errorListeners.delete(listener);
  }

  // Private methods
  private startHeartbeat(): void {
    this.clearTimers();
    
    console.log(`💓 Starting heartbeat with ${this.HEARTBEAT_INTERVAL}ms interval`);
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        console.log('🔄 Sending WebSocket ping');
        try {
          this.ws!.send(JSON.stringify({ 
            type: 'ping', 
            timestamp: Date.now(),
            classId: this.currentClassId 
          }));
          
          // Set timeout to detect if server doesn't respond to ping
          this.heartbeatTimeout = setTimeout(() => {
            console.log('💔 Heartbeat timeout - server not responding, closing connection');
            if (this.ws && this.isConnected()) {
              this.ws.close(1000, 'Heartbeat timeout');
            }
          }, this.HEARTBEAT_TIMEOUT);
          
        } catch (error) {
          console.error('❌ Failed to send heartbeat ping:', error);
          // Close connection if we can't send ping
          if (this.ws && this.isConnected()) {
            this.ws.close(1000, 'Failed to send ping');
          }
        }
      } else {
        console.log('💔 WebSocket not connected, stopping heartbeat');
        this.clearTimers();
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  private clearHeartbeatTimeout(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  private clearTimers(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.clearHeartbeatTimeout();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private attemptReconnect(): void {
    if (!this.shouldReconnect || this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.log('❌ Reconnection disabled or max attempts reached');
      return;
    }

    // Exponential backoff with jitter and maximum cap
    const exponentialDelay = this.RECONNECT_DELAY_BASE * Math.pow(2, this.reconnectAttempts);
    const jitter = Math.random() * 1000; // Add 0-1000ms random jitter
    const delay = Math.min(exponentialDelay + jitter, this.MAX_RECONNECT_DELAY);
    
    this.reconnectAttempts++;
    
    console.log(`🔄 Attempting reconnection in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
    
    this.reconnectTimeout = setTimeout(() => {
      if (this.currentClassId && this.shouldReconnect) {
        console.log(`🔌 Executing reconnection attempt ${this.reconnectAttempts}`);
        this.connect(this.currentClassId).catch(error => {
          console.error('❌ Reconnection failed:', error);
          // Don't increment reconnect attempts here as it's already incremented above
        });
      } else {
        console.log('⏹️ Reconnection cancelled - no class ID or reconnect disabled');
      }
    }, delay);
  }

  private notifyMessageListeners(message: WebSocketMessage): void {
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('❌ Error in message listener:', error);
      }
    });
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (error) {
        console.error('❌ Error in connection listener:', error);
      }
    });
  }

  private notifyErrorListeners(error: string): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (error) {
        console.error('❌ Error in error listener:', error);
      }
    });
  }
}

// Export singleton instance
export const webSocketManager = WebSocketManager.getInstance();