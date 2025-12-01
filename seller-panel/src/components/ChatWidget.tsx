"use client";

import { useState, useEffect, useRef } from "react";
import socketService from "@/services/socket.service";
import { getCurrentSeller } from "@/services/auth.service";
import type { Message } from "@/services/message.service";

interface ChatWidgetProps {
  buyerId: string;
  buyerName: string;
  onNewMessage?: (message: Message) => void;
}

export default function ChatWidget({ buyerId, buyerName, onNewMessage }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const seller = useRef<any>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load seller data
  useEffect(() => {
    const loadSeller = async () => {
      try {
        seller.current = await getCurrentSeller();
      } catch (error) {
        console.error("Error loading seller:", error);
      }
    };

    loadSeller();
  }, []);

  // Setup real-time messaging
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (message: Message) => {
      if (
        (message.sender_id === buyerId && message.recipient_id === seller.current?._id) ||
        (message.sender_id === seller.current?._id && message.recipient_id === buyerId)
      ) {
        setMessages(prev => [...prev, message]);
        if (onNewMessage) {
          onNewMessage(message);
        }
      }
    };

    const handleTyping = (data: { sender_id: string; is_typing: boolean }) => {
      if (data.sender_id === buyerId) {
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
  }, [isOpen, buyerId, onNewMessage]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !seller.current) return;

    try {
      const messageData = {
        recipient_id: buyerId,
        subject: "Chat Message",
        message: newMessage,
        message_type: "general",
        sender_id: seller.current._id,
        sender_type: "Seller",
        recipient_type: "Buyer"
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
        recipient_id: buyerId,
        is_typing: false
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = () => {
    if (!seller.current) return;

    socketService.typing({
      recipient_id: buyerId,
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
            <h3 className="font-medium">{buyerName}</h3>
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
                Start a conversation with {buyerName}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === seller.current?._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 max-w-xs ${
                      message.sender_id === seller.current?._id
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
              <input
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
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
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