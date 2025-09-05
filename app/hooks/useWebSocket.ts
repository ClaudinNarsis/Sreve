import { useEffect, useRef, useState, useCallback } from 'react';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';

// Global WebSocket manager to prevent React Strict Mode issues
class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private socket: WebSocket | null = null;
  private url: string | null = null;
  private status: WebSocketStatus = 'disconnected';
  private subscribers: Set<(status: WebSocketStatus, message?: WebSocketMessage) => void> = new Set();
  private reconnectTimeout: NodeJS.Timeout | undefined;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 0;
  private isConnecting = false;

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  subscribe(callback: (status: WebSocketStatus, message?: WebSocketMessage) => void) {
    this.subscribers.add(callback);
    // Immediately notify subscriber of current status
    callback(this.status);
    
    return () => {
      this.subscribers.delete(callback);
      // If no more subscribers and socket is connected, disconnect
      if (this.subscribers.size === 0 && (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING)) {
        console.log('🧹 [WEBSOCKET-MANAGER] No more subscribers, disconnecting WebSocket');
        this.disconnect();
      }
    };
  }

  private notifySubscribers(status: WebSocketStatus, message?: WebSocketMessage) {
    this.status = status;
    this.subscribers.forEach(callback => callback(status, message));
  }

  connect(url: string) {
    if (this.socket && (this.status === 'connecting' || this.status === 'connected') || this.isConnecting) {
      console.log('⚠️ [WEBSOCKET-MANAGER] Already connecting/connected, skipping connection attempt');
      return;
    }

    if (this.url !== url) {
      this.disconnect();
      this.url = url;
    }

    this.isConnecting = true;
    console.log('🚀 [WEBSOCKET-MANAGER] Starting WebSocket connection...');
    console.log('🌐 [WEBSOCKET-MANAGER] Target URL:', url);

    try {
      this.socket = new WebSocket(url);
      this.notifySubscribers('connecting');

      this.socket.onopen = (event) => {
        console.log('✅ [WEBSOCKET-MANAGER] WebSocket opened successfully!');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifySubscribers('connected');
      };

      this.socket.onmessage = (event) => {
        console.log('📨 [WEBSOCKET-MANAGER] Raw message received:', event.data);
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.notifySubscribers(this.status, message);
        } catch (error) {
          console.error('❌ [WEBSOCKET-MANAGER] Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('🔌 [WEBSOCKET-MANAGER] WebSocket disconnected');
        console.log('📋 [WEBSOCKET-MANAGER] Close event details:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        this.socket = null;
        this.isConnecting = false;
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.notifySubscribers('reconnecting');
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(url);
          }, 1000);
        } else {
          const finalStatus = this.reconnectAttempts >= this.maxReconnectAttempts ? 'error' : 'disconnected';
          this.notifySubscribers(finalStatus);
        }
      };

      this.socket.onerror = (error) => {
        console.error('❌ [WEBSOCKET-MANAGER] WebSocket error occurred:', error);
        this.isConnecting = false;
        this.notifySubscribers('error');
      };

    } catch (error) {
      console.error('💥 [WEBSOCKET-MANAGER] Exception creating WebSocket connection:', error);
      this.isConnecting = false;
      this.notifySubscribers('error');
    }
  }

  disconnect() {
    console.log('🔌 [WEBSOCKET-MANAGER] Disconnect called');
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }

    if (this.socket) {
      console.log('🔌 [WEBSOCKET-MANAGER] Closing existing WebSocket connection');
      this.socket.close(1000, 'User initiated disconnect');
    }

    this.socket = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.notifySubscribers('disconnected');
  }

  sendMessage(message: any): boolean {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        const messageStr = JSON.stringify(message);
        console.log('📤 [WEBSOCKET-MANAGER] Sending message:', messageStr);
        this.socket.send(messageStr);
        return true;
      } catch (error) {
        console.error('❌ [WEBSOCKET-MANAGER] Exception sending WebSocket message:', error);
        return false;
      }
    } else {
      console.warn('⚠️ [WEBSOCKET-MANAGER] Cannot send message - WebSocket not ready');
      return false;
    }
  }

  getSocket(): WebSocket | null {
    return this.socket;
  }

  getStatus(): WebSocketStatus {
    return this.status;
  }
}

export interface WebSocketMessage {
  type: 'start' | 'stream' | 'complete' | 'error';
  message?: string;
  query?: string;
  data?: {
    step: string;
    message: string;
    status: string;
    data?: any;
    result?: any;
  };
  error?: string;
}

export interface UseWebSocketReturn {
  socket: WebSocket | null;
  status: WebSocketStatus;
  sendMessage: (message: any) => boolean;
  connect: () => void;
  disconnect: () => void;
  lastMessage: WebSocketMessage | null;
}

export const useWebSocket = (url: string): UseWebSocketReturn => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const managerRef = useRef<WebSocketManager>(WebSocketManager.getInstance());

  const connect = useCallback(() => {
    console.log('🚀 [WEBSOCKET-HOOK] connect() called, delegating to WebSocketManager');
    managerRef.current.connect(url);
  }, [url]);

  const disconnect = useCallback(() => {
    console.log('🔌 [WEBSOCKET-HOOK] disconnect() called, delegating to WebSocketManager');
    managerRef.current.disconnect();
  }, []);

  const sendMessage = useCallback((message: any): boolean => {
    console.log('📤 [WEBSOCKET-HOOK] sendMessage() called, delegating to WebSocketManager');
    return managerRef.current.sendMessage(message);
  }, []);

  useEffect(() => {
    const manager = managerRef.current;
    
    const unsubscribe = manager.subscribe((newStatus: WebSocketStatus, message?: WebSocketMessage) => {
      console.log('📡 [WEBSOCKET-HOOK] Status update from manager:', newStatus);
      setStatus(newStatus);
      setSocket(manager.getSocket());
      
      if (message) {
        console.log('📨 [WEBSOCKET-HOOK] Message from manager:', message);
        setLastMessage(message);
      }
    });

    return () => {
      console.log('🧹 [WEBSOCKET-HOOK] Cleanup - unsubscribing from WebSocketManager');
      unsubscribe();
    };
  }, []);

  return {
    socket,
    status,
    sendMessage,
    connect,
    disconnect,
    lastMessage
  };
};