"use client";

import { useState, useEffect, useRef } from "react";
import socketService from "@/src/services/socket.service";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface Message {
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

interface SimpleChatInterfaceProps {
  sellerId: string;
  sellerName: string;
  onNewMessage?: (message: Message) => void;
}

export default function SimpleChatInterface({ sellerId, sellerName, onNewMessage }: SimpleChatInterfaceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useRef<any>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        user.current = getCurrentUser();
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadUser();
  }, []);

  // Setup real-time messaging
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (message: Message) => {
      if (
        (message.sender_id === sellerId && message.recipient_id === user.current?.id) ||
        (message.sender_id === user.current?.id && message.recipient_id === sellerId)
      ) {
        setMessages(prev => [...prev, message]);
        if (onNewMessage) {
          onNewMessage(message);
        }
      }
    };

    const handleTyping = (data: { sender_id: string; is_typing: boolean }) => {
      if (data.sender_id === sellerId) {
        setIsTyping(data.is_typing);
        if (data.is_typing) {
          setTimeout(() => setIsTyping(false), 3000);
        }
      }
    };

    socketService.onNewMessage(handleMessage);
    socketService.onTyping(handleTyping);

    return () => {
      socketService.offNewMessage(handleMessage);
      socketService.offTyping(handleTyping);
    };
  }, [isOpen, sellerId, onNewMessage]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user.current) return;

    try {
      const messageData = {
        recipient_id: sellerId,
        subject: "Chat Message",
        message: newMessage,
        message_type: "general",
        sender_id: user.current.id,
        sender_type: "Buyer",
        recipient_type: "Seller"
      };

      // Send via socket
      socketService.sendMessage(messageData);

      // Add to local messages
      const newMsg: Message = {
        id: Date.now().toString(),
        ...messageData,
        status: "unread",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");

      // Stop typing indicator
      socketService.typing({
        recipient_id: sellerId,
        is_typing: false
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = () => {
    if (!user.current) return;

    socketService.typing({
      recipient_id: sellerId,
      is_typing: newMessage.trim() !== ""
    });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 h-96 flex flex-col">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-medium">{sellerName}</h3>
            <button 
              onClick={toggleChat}
              className="text-white hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm mt-4">
                Start a conversation with {sellerName}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user.current?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 max-w-xs ${
                      message.sender_id === user.current?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onInput={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
    </div>
  );
}