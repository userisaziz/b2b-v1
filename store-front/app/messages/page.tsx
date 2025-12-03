"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { MessageSquare, Loader2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import apiClient from "@/lib/api";

import { useRealtimeMessages } from "@/lib/use-realtime-messages";
import { usePresence } from "@/lib/use-presence";
import StorefrontLayout from "@/components/layout/StorefrontLayout";
import { EnhancedChatInterface } from "@/components/messages/enhanced-chat-interface";
import { toast } from "sonner";
import socketService from "@/src/services/socket.service";

interface Message {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  message_type: string;
  sender?: { 
    id: string;
    name: string; 
    company?: string;
    email?: string;
  };
  recipient?: { 
    id: string;
    name: string; 
    company?: string;
    email?: string;
  };
}

export default function MessagesPage() {
  const [inbox, setInbox] = useState<Message[]>([]);
  const [sent, setSent] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const user = getCurrentUser();

  // Real-time presence tracking
  const { isUserOnline } = usePresence({
    userId: user?.id || '',
    enabled: !!user,
  });

  // Setup real-time WebSocket subscription
  const { sendMessage: sendViaWebSocket } = useRealtimeMessages({
    userId: user?.id || '',
    enabled: !!user,
    onNewMessage: (newMessage) => {
      console.log('📨 New message received in real-time!');
      setInbox(prev => [newMessage as Message, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show toast notification for new messages
      toast.info(`New message from ${newMessage.sender?.name || 'Seller'}`, {
        description: newMessage.subject || newMessage.message.substring(0, 100),
        duration: 5000,
        action: {
          label: "View",
          onClick: () => {
            if (newMessage.sender?.id) {
              setSelectedConversationId(newMessage.sender.id);
            }
          }
        }
      });

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('New Message from ' + (newMessage.sender?.name || 'Seller'), {
          body: newMessage.subject || newMessage.message.substring(0, 100),
          icon: '/logo.png',
          badge: '/logo.png',
          tag: 'new-message-' + newMessage.id,
          requireInteraction: false,
        });

        // Click notification to focus window and open conversation
        notification.onclick = () => {
          window.focus();
          if (newMessage.sender?.id) {
            setSelectedConversationId(newMessage.sender.id);
          }
          notification.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      }

      // Play notification sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (e) {
        console.log('Audio not available:', e);
      }

      // Show visual alert if on the page
      if (document.visibilityState === 'visible') {
        console.log('📬 New message from:', newMessage.sender?.name);
      }
    },
    onMessageSent: (sentMessage) => {
      console.log('📤 Message sent via WebSocket!');
      setSent(prev => {
        const exists = prev.find(m => m.id === sentMessage.id);
        if (!exists) {
          return [sentMessage as Message, ...prev];
        }
        return prev;
      });
      
      // Show success toast for sent messages
      toast.success("Message sent successfully!");
    },
    onMessageUpdate: (updatedMessage) => {
      console.log('🔄 Message updated in real-time!');
      setInbox(prev => 
        prev.map(msg => msg.id === updatedMessage.id ? updatedMessage as Message : msg)
      );
    },
    onStatusChange: (status) => {
      console.log('🔌 WebSocket status:', status);
      if (status === 'SUBSCRIBED') {
        toast.success("Connected to real-time messaging");
      } else if (status === 'CLOSED') {
        toast.error("Lost connection to messaging service");
      }
    },
  });

  // Setup presence tracking
  useEffect(() => {
    if (!user?.id) return;

    // Connect to socket and register user
    socketService.connect(user.id);
    
    // Request online users
    socketService.requestOnlineUsers();
    
    // Listen for online users
    const handleOnlineUsers = (users: string[]) => {
      setOnlineUsers(new Set(users));
    };
    socketService.onOnlineUsers(handleOnlineUsers);
    
    // Listen for user status changes
    const handleUserStatusChanged = (data: { userId: string; status: 'online' | 'offline' | 'away' }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.status === 'online') {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    };
    socketService.onUserStatusChanged(handleUserStatusChanged);

    // Notify that user is online
    socketService.updateStatus('online');

    return () => {
      socketService.offOnlineUsers(handleOnlineUsers);
      socketService.offUserStatusChanged(handleUserStatusChanged);
      socketService.updateStatus('offline');
    };
  }, [user?.id]);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const [inboxRes, sentRes] = await Promise.all([
        apiClient.get('/messages/inbox', { params: { limit: 100 } }),
        apiClient.get('/messages/sent', { params: { limit: 100 } })
      ]);
      
      setInbox(inboxRes.data.data || []);
      setSent(sentRes.data.data || []);
      
      const unread = (inboxRes.data.data || []).filter((m: Message) => m.status === 'unread').length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      window.location.href = '/login?redirect=/messages';
      return;
    }
    
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Group messages into conversations
  const conversations = useMemo(() => {
    const convMap = new Map<string, any>();
    
    [...inbox, ...sent].forEach(msg => {
      const isSent = !msg.sender || msg.sender.id === user?.id;
      const participant = isSent ? msg.recipient : msg.sender;
      
      if (!participant) return;
      
      const key = participant.id;
      const existing = convMap.get(key);
      
      if (!existing || new Date(msg.created_at) > new Date(existing.lastMessageTime)) {
        const online = onlineUsers.has(participant.id);
        convMap.set(key, {
          id: key,
          participantId: participant.id,
          participantName: participant.name,
          participantEmail: participant.email,
          participantCompany: participant.company,
          lastMessage: msg.message?.substring(0, 50) || msg.subject,
          lastMessageTime: msg.created_at,
          unreadCount: inbox.filter(m => 
            m.sender?.id === participant.id && m.status === 'unread'
          ).length,
          status: online ? 'online' : 'offline' as const,
        });
      }
    });
    
    return Array.from(convMap.values()).sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  }, [inbox, sent, user, onlineUsers]);

  // Get messages for selected conversation
  const conversationMessages = useMemo(() => {
    if (!selectedConversationId) return [];
    
    const msgs = [...inbox, ...sent]
      .filter(msg => {
        const sender = msg.sender?.id;
        const recipient = msg.recipient?.id;
        return sender === selectedConversationId || recipient === selectedConversationId;
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(msg => ({
        ...msg,
        isSent: !msg.sender || msg.sender.id === user?.id,
      }));
    
    return msgs;
  }, [inbox, sent, selectedConversationId, user]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  const handleLoadMessages = async (conversationId: string) => {
    const unreadMessages = inbox.filter(
      msg => msg.sender?.id === conversationId && msg.status === 'unread'
    );
    
    for (const msg of unreadMessages) {
      try {
        await apiClient.get(`/messages/${msg.id}`);
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
    
    await loadMessages();
  };

  const handleSendMessage = async (recipientId: string, messageText: string) => {
    try {
      setSending(true);
      // Send via WebSocket (pure Supabase) - NO REST API!
      await sendViaWebSocket({
        recipient_id: recipientId,
        subject: 'Message',
        message: messageText,
        message_type: 'general',
      });
      console.log('✅ Message sent via WebSocket');
      // WebSocket will automatically update both sender and receiver
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <StorefrontLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <p className="mt-4 text-gray-600">Loading messages...</p>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">Chat with sellers and manage your conversations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                <MessageSquare className="h-4 w-4 inline mr-2" />
                Unread Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{unreadCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                <Users className="h-4 w-4 inline mr-2" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{conversations.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                <MessageSquare className="h-4 w-4 inline mr-2" />
                Total Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{inbox.length + sent.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <EnhancedChatInterface
          conversations={conversations}
          messages={conversationMessages}
          currentUserId={user?.id || ''}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onSendMessage={handleSendMessage}
          onLoadMessages={handleLoadMessages}
          onBack={() => setSelectedConversationId(null)}
          sending={sending}
        />
      </div>
    </StorefrontLayout>
  );
}