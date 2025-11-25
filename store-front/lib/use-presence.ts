import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

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
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !userId) return;

    console.log('👥 Setting up presence tracking for user:', userId);

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const online = new Set<string>();

        Object.keys(presenceState).forEach((key) => {
          const presences = presenceState[key];
          if (presences && presences.length > 0) {
            online.add(key);
          }
        });

        console.log('👥 Online users updated:', Array.from(online));
        setOnlineUsers(online);
      })
      .on('presence', { event: 'join' }, ({ key }: { key: string }) => {
        console.log('✅ User joined:', key);
        setOnlineUsers((prev) => new Set([...prev, key]));
      })
      .on('presence', { event: 'leave' }, ({ key }: { key: string }) => {
        console.log('❌ User left:', key);
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          // Track this user as online
          await channel.track({
            userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      console.log('👥 Cleaning up presence tracking');
      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
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
