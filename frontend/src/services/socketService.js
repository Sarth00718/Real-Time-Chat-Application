import io from 'socket.io-client';
import { BASE_URL } from '../config/constants';

/**
 * Socket Service - Singleton pattern for managing Socket.IO connection
 * This ensures only one socket instance exists throughout the application
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.isConnecting = false;
  }

  /**
   * Connect to socket server
   * @param {string} userId - The authenticated user's ID
   * @returns {Socket} The socket instance
   */
  connect(userId) {
    // Prevent multiple connections
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    if (this.isConnecting) {
      console.log('Socket connection in progress');
      return this.socket;
    }

    this.isConnecting = true;

    try {
      const token = localStorage.getItem('token');

      this.socket = io(BASE_URL, {
        query: { userId },
        auth: token ? { token } : undefined,
        withCredentials: true,
        transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 20000
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
        this.isConnecting = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
        this.isConnecting = false;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        this.isConnecting = false;
      });

      return this.socket;
    } catch (error) {
      console.error('Failed to create socket connection:', error);
      this.isConnecting = false;
      return null;
    }
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
    }
  }

  /**
   * Reconnect to socket server
   */
  reconnect() {
    if (this.socket) {
      console.log('Reconnecting socket...');
      this.socket.connect();
    }
  }

  /**
   * Get the current socket instance
   * @returns {Socket|null}
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Check if socket is connected
   * @returns {boolean}
   */
  isConnected() {
    return this.socket?.connected || false;
  }

  /**
   * Emit an event to the server
   * @param {string} event - Event name
   * @param {any} data - Data to send
   */
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }

  /**
   * Listen to an event from the server
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function (optional)
   */
  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
