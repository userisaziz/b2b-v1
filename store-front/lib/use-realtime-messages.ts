import { useEffect, useCallback, useRef } from 'react';
import socketService from '@/src/services/socket.service';
import { getCurrentUser } from './auth';

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

  // Function to send message via Socket.IO
  const sendMessage = useCallback(async ({ recipient_id, subject, message, message_type }: SendMessageParams) => {
    if (!userId) {
      throw new Error('User ID is required to send messages');
    }

    try {
      console.log('📤 Sending message via Socket.IO...');

      const currentUser = getCurrentUser();
      const messageData = {
        recipient_id,
        subject,
        message,
        message_type,
        sender_id: userId,
        sender_type: currentUser?.role === 'seller' ? 'Seller' : 'Buyer'
      };

      // Send via Socket.IO
      socketService.sendMessage(messageData);
      console.log('✅ Message sent successfully via Socket.IO');
      
      // Return a mock response to match the existing interface
      return {
        id: Date.now().toString(),
        ...messageData,
        status: 'unread',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }, [userId]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!enabled || !userId) return;

    console.log('📡 Setting up real-time Socket.IO subscription for user:', userId);

    // Connect to Socket.IO
    socketService.connect(userId);

    // Listen for new messages
    socketService.onNewMessage((message: Message) => {
      console.log('✉️ New message received via Socket.IO:', message);
      
      // Check if this is a received message
      if (message.recipient_id === userId) {
        if (onNewMessageRef.current) {
          onNewMessageRef.current(message);
        }
      } 
      // Check if this is a sent message
      else if (message.sender_id === userId) {
        if (onMessageSentRef.current) {
          onMessageSentRef.current(message);
        }
      }
    });

    // Listen for message updates
    socketService.onMessageUpdated((message: Message) => {
      console.log('🔄 Message updated via Socket.IO:', message);
      
      if (message.recipient_id === userId && onMessageUpdateRef.current) {
        onMessageUpdateRef.current(message);
      }
    });

    if (onStatusChangeRef.current) {
      onStatusChangeRef.current('CONNECTED');
    }

    return () => {
      console.log('🔌 Cleaning up Socket.IO subscription');
      socketService.offNewMessage(() => {});
      socketService.offMessageUpdated(() => {});
    };
  }, [userId, enabled]);

  useEffect(() => {
    const cleanup = setupRealtimeSubscription();
    return () => {
      if (cleanup) cleanup();
    };
  }, [setupRealtimeSubscription]);

  const unsubscribe = useCallback(() => {
    socketService.disconnect();
  }, []);

  return { unsubscribe, sendMessage };
};