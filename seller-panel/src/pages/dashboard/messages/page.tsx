"use client";

import { useState, useEffect, useRef } from "react";
import type { Message } from "@/services/message.service";
import { getInbox, getSent, sendMessage, markAsRead, getUnreadCount } from "@/services/message.service";
import socketService from "@/services/socket.service";
import { getCurrentSeller } from "@/services/auth.service";
import { Send, Search, Archive, MoreVertical, Paperclip, Smile, Phone, Video, User, Building, Calendar, Clock } from "lucide-react";

export default function MessagesPage() {
  const [inbox, setInbox] = useState<Message[]>([]);
  const [sent, setSent] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient_id: "",
    subject: "",
    message: "",
    message_type: "general" as "general" | "rfq_response" | "order_update",
    recipient_type: "Buyer" as "Buyer" | "Seller"
  });
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages
  const loadMessages = async () => {
    try {
      setLoading(true);
      const [inboxData, sentData] = await Promise.all([
        getInbox(),
        getSent()
      ]);
      setInbox(inboxData.data);
      setSent(sentData.data);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load unread count
  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize
  useEffect(() => {
    const loadSeller = async () => {
      try {
        const sellerData = await getCurrentSeller();
        setSeller(sellerData);
        
        loadMessages();
        loadUnreadCount();
        
        socketService.connect(sellerData._id);
        
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
        
        // Listen for new messages
        const handleNewMessage = (message: Message) => {
          if (message.recipient_id === sellerData._id) {
            setInbox(prev => [message, ...prev]);
            // Update unread count
            setUnreadCount(prev => prev + 1);
          } else if (message.sender_id === sellerData._id) {
            setSent(prev => [message, ...prev]);
          }
        };
        socketService.onNewMessage(handleNewMessage);
        
        // Listen for message updates
        const handleMessageUpdated = (message: Message) => {
          if (message.recipient_id === sellerData._id) {
            setInbox(prev => prev.map(msg => msg.id === message.id ? message : msg));
            // If message was marked as read, decrease unread count
            if (message.status === "read" && selectedMessage?.id === message.id) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          } else if (message.sender_id === sellerData._id) {
            setSent(prev => prev.map(msg => msg.id === message.id ? message : msg));
          }
          
          if (selectedMessage?.id === message.id) {
            setSelectedMessage(message);
          }
        };
        socketService.onMessageUpdated(handleMessageUpdated);
        
        // Notify that user is online
        socketService.updateStatus('online');
        
        return () => {
          socketService.offOnlineUsers(handleOnlineUsers);
          socketService.offUserStatusChanged(handleUserStatusChanged);
          socketService.offNewMessage(handleNewMessage);
          socketService.offMessageUpdated(handleMessageUpdated);
          socketService.updateStatus('offline');
        };
      } catch (error) {
        console.error("Error loading seller:", error);
      }
    };

    loadSeller();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [selectedMessage]);

  // Handle message selection
  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);
    if (message.status === "unread" && message.recipient_id === seller?._id) {
      try {
        await markAsRead(message.id);
        // Update local state
        setInbox(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: "read" } : msg
        ));
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Notify via socket that message was read
        socketService.markAsRead({
          message_id: message.id,
          recipient_id: message.recipient_id,
          reader_id: seller._id
        });
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const messageData = {
        ...newMessage,
        sender_id: seller._id,
        sender_type: "Seller"
      };
      
      const response = await sendMessage(messageData);
      setSent(prev => [response.data, ...prev]);
      setShowCompose(false);
      setNewMessage({
        recipient_id: "",
        subject: "",
        message: "",
        message_type: "general",
        recipient_type: "Buyer"
      });
      
      // Notify via socket
      socketService.sendMessage(response.data);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Check if user is online
  const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId);
  };

  // Filter messages based on search term
  const filteredMessages = (activeTab === "inbox" ? inbox : sent).filter(message => {
    const searchLower = searchTerm.toLowerCase();
    return (
      message.subject.toLowerCase().includes(searchLower) ||
      message.message.toLowerCase().includes(searchLower) ||
      (message.sender?.name && message.sender.name.toLowerCase().includes(searchLower)) ||
      (message.recipient?.name && message.recipient.name.toLowerCase().includes(searchLower))
    );
  });

  // Get initials for avatar
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
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <button
          onClick={() => setShowCompose(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
          Compose
        </button>
      </div>

      {showCompose && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Compose Message</h2>
            <button 
              onClick={() => setShowCompose(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSendMessage}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient ID</label>
                <input
                  type="text"
                  value={newMessage.recipient_id}
                  onChange={(e) => setNewMessage({...newMessage, recipient_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Type</label>
                <select
                  value={newMessage.recipient_type}
                  onChange={(e) => setNewMessage({...newMessage, recipient_type: e.target.value as "Buyer" | "Seller"})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Buyer">Buyer</option>
                  <option value="Seller">Seller</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={newMessage.message}
                onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Conversations Sidebar */}
        <div className={`w-full md:w-96 border-r border-gray-200 flex flex-col ${selectedMessage ? "hidden md:flex" : "flex"}`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("inbox")}
                className={`flex-1 py-2 px-3 text-center text-sm font-medium rounded-md transition-colors ${
                  activeTab === "inbox"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Inbox ({inbox.filter(m => m.status === "unread").length})
              </button>
              <button
                onClick={() => setActiveTab("sent")}
                className={`flex-1 py-2 px-3 text-center text-sm font-medium rounded-md transition-colors ${
                  activeTab === "sent"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sent
              </button>
            </div>
          </div>
          
          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {searchTerm ? "No messages match your search" : `No ${activeTab} messages`}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredMessages.map((message) => {
                  const otherParty = activeTab === "inbox" ? message.sender : message.recipient;
                  const isOnline = otherParty?.id && isUserOnline(otherParty.id);
                  
                  return (
                    <div
                      key={message.id}
                      onClick={() => handleSelectMessage(message)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedMessage?.id === message.id ? "bg-blue-50 border-r-4 border-blue-500" : ""
                      } ${message.status === "unread" && activeTab === "inbox" ? "bg-blue-50/50" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                            {otherParty?.name ? getInitials(otherParty.name) : "U"}
                          </div>
                          {isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {otherParty?.name || "Unknown"}
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatMessageTime(message.created_at)}
                            </span>
                          </div>
                          
                          <p className="text-sm font-medium text-gray-700 truncate mt-1">
                            {message.subject}
                          </p>
                          
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {message.message.substring(0, 60)}{message.message.length > 60 ? "..." : ""}
                          </p>
                          
                          {message.status === "unread" && activeTab === "inbox" && (
                            <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Unread
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${selectedMessage ? "flex" : "hidden md:flex"}`}>
          {!selectedMessage ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="md:hidden text-gray-500 hover:text-gray-700 mr-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                      {selectedMessage.sender?.name ? getInitials(selectedMessage.sender.name) : "U"}
                    </div>
                    {selectedMessage.sender?.id && isUserOnline(selectedMessage.sender.id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {activeTab === "inbox" ? selectedMessage.sender?.name : selectedMessage.recipient?.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedMessage.sender?.id && isUserOnline(selectedMessage.sender.id) 
                        ? "Online" 
                        : "Offline"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Message Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">{selectedMessage.subject}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {selectedMessage.sender?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {selectedMessage.sender?.company || "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(selectedMessage.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(selectedMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedMessage.status === "read" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {selectedMessage.status === "read" ? "Read" : "Unread"}
                      </span>
                    </div>
                    
                    <div className="prose max-w-none border-t border-gray-200 pt-4">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>
                  
                  {/* Reply Form */}
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      // Handle reply functionality here
                    }}>
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <textarea
                            placeholder="Type your reply..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          ></textarea>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                          >
                            <Paperclip className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                          >
                            <Smile className="h-5 w-5" />
                          </button>
                          <button
                            type="submit"
                            className="p-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full hover:from-blue-700 hover:to-indigo-800 shadow-md"
                          >
                            <Send className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                
                <div ref={messagesEndRef} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}