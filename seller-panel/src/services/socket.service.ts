import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    if (this.socket?.connected && this.userId === userId) {
      return;
    }

    // Disconnect existing connection
    if (this.socket) {
      this.socket.disconnect();
    }

    this.userId = userId;
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      if (this.userId) {
        this.socket?.emit('register_user', this.userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  sendMessage(data: any) {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  onNewMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  offNewMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('new_message', callback);
    }
  }

  onMessageUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('message_updated', callback);
    }
  }

  offMessageUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('message_updated', callback);
    }
  }

  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join_room', roomId);
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('leave_room', roomId);
    }
  }

  typing(data: { recipient_id: string; is_typing: boolean; conversation_id?: string }) {
    if (this.socket) {
      this.socket.emit('typing', data);
    }
  }

  onTyping(callback: (data: { sender_id: string; is_typing: boolean; conversation_id?: string }) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  offTyping(callback: (data: { sender_id: string; is_typing: boolean; conversation_id?: string }) => void) {
    if (this.socket) {
      this.socket.off('user_typing', callback);
    }
  }

  markAsRead(data: { message_id: string; recipient_id: string; reader_id: string }) {
    if (this.socket) {
      this.socket.emit('mark_as_read', data);
    }
  }

  onMessageRead(callback: (data: { message_id: string; reader_id: string; timestamp: Date }) => void) {
    if (this.socket) {
      this.socket.on('message_read', callback);
    }
  }

  offMessageRead(callback: (data: { message_id: string; reader_id: string; timestamp: Date }) => void) {
    if (this.socket) {
      this.socket.off('message_read', callback);
    }
  }

  onMessageDelivered(callback: (data: { messageId: string; timestamp: Date }) => void) {
    if (this.socket) {
      this.socket.on('message_delivered', callback);
    }
  }

  offMessageDelivered(callback: (data: { messageId: string; timestamp: Date }) => void) {
    if (this.socket) {
      this.socket.off('message_delivered', callback);
    }
  }

  // Presence tracking methods
  notifyUserOnline(userId: string) {
    if (this.socket) {
      this.socket.emit('user_online', userId);
    }
  }

  notifyUserOffline(userId: string) {
    if (this.socket) {
      this.socket.emit('user_offline', userId);
    }
  }

  requestOnlineUsers() {
    if (this.socket) {
      this.socket.emit('request_online_users');
    }
  }

  onOnlineUsers(callback: (users: string[]) => void) {
    if (this.socket) {
      this.socket.on('online_users', callback);
    }
  }

  offOnlineUsers(callback: (users: string[]) => void) {
    if (this.socket) {
      this.socket.off('online_users', callback);
    }
  }

  onUserStatusChanged(callback: (data: { userId: string; status: 'online' | 'offline' | 'away' }) => void) {
    if (this.socket) {
      this.socket.on('user_status_changed', callback);
    }
  }

  offUserStatusChanged(callback: (data: { userId: string; status: 'online' | 'offline' | 'away' }) => void) {
    if (this.socket) {
      this.socket.off('user_status_changed', callback);
    }
  }

  updateStatus(status: 'online' | 'offline' | 'away') {
    if (this.socket) {
      this.socket.emit('update_status', { status });
    }
  }
}

export default new SocketService();