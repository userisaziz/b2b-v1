import { useEffect, useRef, useState, useCallback } from 'react';
import socketService from '@/src/services/socket.service';

export interface UserPresence {
  userId: string;
  online: boolean;
  lastSeen: string;
}

interface UsePresenceOptions {
  userId: string;
  enabled?: boolean;
}

export const usePresence = ({ userId, enabled = true }: UsePresenceOptions) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const onlineUsersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !userId) return;

    console.log('👥 Setting up presence tracking for user:', userId);

    // Connect to Socket.IO
    socketService.connect(userId);

    // Listen for user join events
    socketService.onUserJoin((joinedUserId: string) => {
      console.log('✅ User joined:', joinedUserId);
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.add(joinedUserId);
        onlineUsersRef.current = next;
        return next;
      });
    });

    // Listen for user leave events
    socketService.onUserLeave((leftUserId: string) => {
      console.log('❌ User left:', leftUserId);
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(leftUserId);
        onlineUsersRef.current = next;
        return next;
      });
    });

    // Request current online users
    socketService.requestOnlineUsers();

    // Listen for online users list
    socketService.onOnlineUsers((users: string[]) => {
      console.log('👥 Online users updated:', users);
      const userSet = new Set(users);
      setOnlineUsers(userSet);
      onlineUsersRef.current = userSet;
    });

    // Notify others that this user is online
    socketService.notifyUserOnline(userId);

    // Cleanup on unmount
    return () => {
      console.log('👥 Cleaning up presence tracking');
      socketService.notifyUserOffline(userId);
      socketService.disconnect();
    };
  }, [userId, enabled]);

  const isUserOnline = useCallback(
    (checkUserId: string) => onlineUsers.has(checkUserId),
    [onlineUsers]
  );

  return {
    onlineUsers: Array.from(onlineUsers),
    isUserOnline,
  };
};