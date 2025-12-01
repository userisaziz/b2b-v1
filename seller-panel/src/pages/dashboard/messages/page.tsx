"use client";

import { useState, useEffect } from "react";
import type { Message } from "@/services/message.service";
import { getInbox, getSent, sendMessage, markAsRead, getUnreadCount } from "@/services/message.service";
import socketService from "@/services/socket.service";
import { getCurrentSeller } from "@/services/auth.service";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <button
          onClick={() => setShowCompose(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
          Compose
        </button>
      </div>

      {showCompose && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Compose Message</h2>
          <form onSubmit={handleSendMessage}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient ID</label>
                <input
                  type="text"
                  value={newMessage.recipient_id}
                  onChange={(e) => setNewMessage({...newMessage, recipient_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Type</label>
                <select
                  value={newMessage.recipient_type}
                  onChange={(e) => setNewMessage({...newMessage, recipient_type: e.target.value as "Buyer" | "Seller"})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={newMessage.message}
                onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("inbox")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "inbox"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Inbox ({inbox.filter(m => m.status === "unread").length})
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "sent"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Sent
            </button>
          </nav>
        </div>

        <div className="flex">
          <div className={`w-full md:w-1/3 border-r border-gray-200 ${selectedMessage ? "hidden md:block" : ""}`}>
            {activeTab === "inbox" ? (
              <div className="divide-y divide-gray-200">
                {inbox.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No messages in your inbox
                  </div>
                ) : (
                  inbox.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleSelectMessage(message)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedMessage?.id === message.id ? "bg-blue-50" : ""
                      } ${message.status === "unread" ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
                    >
                      <div className="flex justify-between">
                        <h3 className="font-medium text-gray-900">
                          {message.sender?.name || "Unknown Sender"}
                          {message.sender?.id && isUserOnline(message.sender.id) && (
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                          )}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{message.subject}</p>
                      <p className="text-xs text-gray-500 truncate">{message.message.substring(0, 50)}...</p>
                      {message.status === "unread" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          Unread
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {sent.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No sent messages
                  </div>
                ) : (
                  sent.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleSelectMessage(message)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedMessage?.id === message.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex justify-between">
                        <h3 className="font-medium text-gray-900">
                          {message.recipient?.name || "Unknown Recipient"}
                          {message.recipient?.id && isUserOnline(message.recipient.id) && (
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                          )}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{message.subject}</p>
                      <p className="text-xs text-gray-500 truncate">{message.message.substring(0, 50)}...</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedMessage && (
            <div className="w-full md:w-2/3 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">From:</span> {selectedMessage.sender?.name} ({selectedMessage.sender?.email})
                      {selectedMessage.sender?.id && isUserOnline(selectedMessage.sender.id) && (
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">To:</span> {selectedMessage.recipient?.name}
                      {selectedMessage.recipient?.id && isUserOnline(selectedMessage.recipient.id) && (
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="md:hidden text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="prose max-w-none border-t border-gray-200 pt-4">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}