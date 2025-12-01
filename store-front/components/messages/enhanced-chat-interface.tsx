"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Search, ArrowLeft, Paperclip, Smile, MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import socketService from "@/src/services/socket.service";

interface MessageUser {
  id: string;
  name: string;
  email?: string;
  company?: string;
}

interface Message {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  message_type: string;
  sender?: MessageUser;
  recipient?: MessageUser;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  participantCompany?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  status: 'online' | 'offline' | 'away';
}

interface ChatMessage extends Message {
  isSent: boolean;
  delivered?: boolean;
  read?: boolean;
}

interface EnhancedChatInterfaceProps {
  conversations: Conversation[];
  messages: ChatMessage[];
  currentUserId: string;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onSendMessage: (recipientId: string, message: string) => Promise<void>;
  onLoadMessages: (conversationId: string) => Promise<void>;
  onBack?: () => void;
  sending?: boolean;
}

export function EnhancedChatInterface({
  conversations,
  messages,
  currentUserId,
  selectedConversationId,
  onSelectConversation,
  onSendMessage,
  onLoadMessages,
  onBack,
  sending = false,
}: EnhancedChatInterfaceProps) {
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participantCompany?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      inputRef.current?.focus();
    }
  }, [selectedConversationId]);

  // Setup typing indicators
  useEffect(() => {
    if (!selectedConversationId) return;

    const handleTyping = (data: { sender_id: string; is_typing: boolean; conversation_id?: string }) => {
      if (data.conversation_id === selectedConversationId) {
        setTypingUsers(prev => ({
          ...prev,
          [data.sender_id]: data.is_typing
        }));

        // Clear typing indicator after 3 seconds
        if (data.is_typing) {
          setTimeout(() => {
            setTypingUsers(prev => {
              const newTyping = { ...prev };
              delete newTyping[data.sender_id];
              return newTyping;
            });
          }, 3000);
        }
      }
    };

    socketService.onTyping(handleTyping);

    return () => {
      socketService.offTyping(handleTyping);
    };
  }, [selectedConversationId]);

  // Send typing indicator
  const sendTypingIndicator = (isTyping: boolean) => {
    if (!selectedConversation) return;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        socketService.typing({
          recipient_id: selectedConversation.participantId,
          is_typing: false,
          conversation_id: selectedConversationId || undefined
        });
        setIsTyping(false);
      }, 1000);
    }

    // Send typing indicator
    socketService.typing({
      recipient_id: selectedConversation.participantId,
      is_typing: isTyping,
      conversation_id: selectedConversationId || undefined
    });
    setIsTyping(isTyping);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || sending) return;

    try {
      await onSendMessage(selectedConversation.participantId, messageText);
      setMessageText("");
      
      // Stop typing indicator
      sendTypingIndicator(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);
    
    // Send typing indicator
    if (value.trim() !== "") {
      sendTypingIndicator(true);
    } else {
      sendTypingIndicator(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Conversations Sidebar */}
      <div className={`w-full md:w-96 border-r flex flex-col ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <p className="text-gray-500">No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  onLoadMessages(conv.id);
                }}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b ${
                  selectedConversationId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(conv.participantName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                    conv.status === 'online' ? 'bg-green-500' :
                    conv.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm truncate">{conv.participantName}</p>
                    {conv.lastMessageTime && (
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  {conv.participantCompany && (
                    <p className="text-xs text-gray-500 truncate">{conv.participantCompany}</p>
                  )}
                  {conv.lastMessage && (
                    <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage}</p>
                  )}
                </div>
                {conv.unreadCount > 0 && (
                  <Badge className="ml-2 flex-shrink-0">{conv.unreadCount}</Badge>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${selectedConversationId ? 'flex' : 'hidden md:flex'}`}>
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="md:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {getInitials(selectedConversation.participantName)}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                  selectedConversation.status === 'online' ? 'bg-green-500' :
                  selectedConversation.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{selectedConversation.participantName}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    selectedConversation.status === 'online' ? 'bg-green-500' :
                    selectedConversation.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  {selectedConversation.status === 'online' ? 'Online' : 
                   selectedConversation.status === 'away' ? 'Away' : 'Offline'}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const isGrouped = index > 0 && 
                      messages[index - 1].isSent === message.isSent &&
                      new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() < 60000;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${message.isSent ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-4'}`}
                      >
                        <div className={`flex gap-2 max-w-[70%] ${message.isSent ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isGrouped && !message.isSent && (
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white text-xs">
                                {getInitials(message.sender?.name || 'U')}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {isGrouped && !message.isSent && <div className="w-8" />}
                          
                          <div className={`flex flex-col ${message.isSent ? 'items-end' : 'items-start'}`}>
                            {!isGrouped && (
                              <div className="flex items-center gap-2 mb-1 px-1">
                                <span className="text-xs font-medium text-gray-700">
                                  {message.isSent ? 'You' : message.sender?.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatMessageTime(message.created_at)}
                                </span>
                                {message.isSent && message.delivered && (
                                  <span className="text-xs text-gray-400">✓</span>
                                )}
                                {message.isSent && message.read && (
                                  <span className="text-xs text-blue-500">✓✓</span>
                                )}
                              </div>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                message.isSent
                                  ? 'bg-blue-600 text-white rounded-br-sm'
                                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                              }`}
                            >
                              {message.subject && !isGrouped && (
                                <p className={`text-xs font-semibold mb-1 ${message.isSent ? 'text-blue-100' : 'text-gray-600'}`}>
                                  {message.subject}
                                </p>
                              )}
                              <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                            </div>
                            {isGrouped && (
                              <span className="text-xs text-gray-400 px-1 mt-0.5">
                                {formatMessageTime(message.created_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                  
                  {/* Typing indicator */}
                  {typingUsers[selectedConversation.participantId] && (
                    <div className="flex justify-start mt-2">
                      <div className="flex gap-2 max-w-[70%]">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white text-xs">
                            {getInitials(selectedConversation.participantName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <Button type="button" variant="ghost" size="sm" className="mb-1">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button type="button" variant="ghost" size="sm" className="mb-1">
                  <Smile className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    value={messageText}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                </div>
                <Button type="submit" disabled={sending || !messageText.trim()} className="mb-1">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}