import { useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  message: string;
  message_type: string;
  status: 'read' | 'unread';
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  recipient?: {
    id: string;
    name: string;
    company?: string;
  };
}

interface UseRealtimeMessagesOptions {
  userId: string;
  onNewMessage?: (message: Message) => void;
  onMessageUpdate?: (message: Message) => void;
  onMessageSent?: (message: Message) => void;
  onStatusChange?: (status: string) => void;
  enabled?: boolean;
}

interface SendMessageParams {
  recipient_id: string;
  subject: string;
  message: string;
  message_type: string;
}

export const useRealtimeMessages = ({
  userId,
  onNewMessage,
  onMessageUpdate,
  onMessageSent,
  onStatusChange,
  enabled = true,
}: UseRealtimeMessagesOptions) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onNewMessageRef = useRef(onNewMessage);
  const onMessageUpdateRef = useRef(onMessageUpdate);
  const onMessageSentRef = useRef(onMessageSent);
  const onStatusChangeRef = useRef(onStatusChange);

  // Keep refs updated
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onMessageUpdateRef.current = onMessageUpdate;
    onMessageSentRef.current = onMessageSent;
    onStatusChangeRef.current = onStatusChange;
  }, [onNewMessage, onMessageUpdate, onMessageSent, onStatusChange]);

  // Function to send message via Supabase (no REST API)
  const sendMessage = useCallback(async ({ recipient_id, subject, message, message_type }: SendMessageParams) => {
    if (!userId) {
      throw new Error('User ID is required to send messages');
    }

    try {
      console.log('📤 Sending message via Supabase direct insert...');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          recipient_id,
          subject,
          message,
          message_type,
          status: 'unread',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`
          *,
          recipient:users!recipient_id(id, name, email, company)
        `)
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);
        throw error;
      }

      console.log('✅ Message sent successfully via Supabase:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }, [userId]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!enabled || !userId) return;

    console.log('📡 Setting up real-time WebSocket subscription for user:', userId);

    // Create a channel for this user's messages
    const channel = supabase
      .channel(`messages:${userId}`)
      // Listen for messages received (recipient_id = userId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        async (payload: any) => {
          console.log('✉️ New message received via WebSocket:', payload);

          // Fetch the complete message with sender info
          const { data: message, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:users!sender_id(id, name, email, company)
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && message && onNewMessageRef.current) {
            onNewMessageRef.current(message as Message);
          }
        }
      )
      // Listen for messages sent (sender_id = userId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${userId}`,
        },
        async (payload: any) => {
          console.log('📤 Message sent via WebSocket:', payload);

          // Fetch the complete message with recipient info
          const { data: message, error } = await supabase
            .from('messages')
            .select(`
              *,
              recipient:users!recipient_id(id, name, email, company)
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && message && onMessageSentRef.current) {
            onMessageSentRef.current(message as Message);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        async (payload: any) => {
          console.log('🔄 Message updated via WebSocket:', payload);

          // Fetch the updated message with sender info
          const { data: message, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:users!sender_id(id, name, email, company)
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && message && onMessageUpdateRef.current) {
            onMessageUpdateRef.current(message as Message);
          }
        }
      )
      .subscribe((status: string) => {
        console.log('🔌 WebSocket subscription status:', status);
        if (onStatusChangeRef.current) {
          onStatusChangeRef.current(status);
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('🔌 Cleaning up WebSocket subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, enabled]);

  useEffect(() => {
    const cleanup = setupRealtimeSubscription();
    return () => {
      if (cleanup) cleanup();
    };
  }, [setupRealtimeSubscription]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  return { unsubscribe, sendMessage };
};
