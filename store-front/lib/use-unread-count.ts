import { useState, useEffect } from 'react';
import apiClient from './api';
import { useRealtimeMessages } from './use-realtime-messages';

export const useUnreadMessageCount = (userId: string, enabled: boolean = true) => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Load initial count
  useEffect(() => {
    if (!enabled || !userId) return;

    const loadCount = async () => {
      try {
        const response = await apiClient.get('/messages/inbox', {
          params: { status: 'unread', limit: 1000 }
        });
        const unread = response.data.data?.length || 0;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadCount();
  }, [userId, enabled]);

  // Subscribe to real-time updates
  useRealtimeMessages({
    userId,
    enabled,
    onNewMessage: () => {
      setUnreadCount(prev => prev + 1);
    },
    onMessageUpdate: async (message) => {
      // If message was marked as read, decrease count
      if (message.status === 'read') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    },
  });

  return unreadCount;
};
