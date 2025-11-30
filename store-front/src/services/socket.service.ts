import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class SocketService {
  private socket: any = null;
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

  typing(data: { recipient_id: string; is_typing: boolean }) {
    if (this.socket) {
      this.socket.emit('typing', data);
    }
  }

  onTyping(callback: (data: { sender_id: string; is_typing: boolean }) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  offTyping(callback: (data: { sender_id: string; is_typing: boolean }) => void) {
    if (this.socket) {
      this.socket.off('user_typing', callback);
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

  onUserJoin(callback: (userId: string) => void) {
    if (this.socket) {
      this.socket.on('user_joined', callback);
    }
  }

  onUserLeave(callback: (userId: string) => void) {
    if (this.socket) {
      this.socket.on('user_left', callback);
    }
  }

  onOnlineUsers(callback: (users: string[]) => void) {
    if (this.socket) {
      this.socket.on('online_users', callback);
    }
  }
}

export default new SocketService();