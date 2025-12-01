"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Eye,
  Calendar,
  ArrowLeft,
  Send,
  Package
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StorefrontLayout from "@/components/layout/StorefrontLayout";
import { getCurrentUser } from "@/lib/auth";
import apiClient from "@/lib/api";
import { useRealtimeMessages } from "@/lib/use-realtime-messages";

interface RFQ {
  id: string;
  title: string;
  category_id: string;
  description: string;
  status: string;
  created_at: string;
  deadline?: string;
}

interface Message {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  sender?: { name: string; company?: string };
}

export default function MyAccountPage() {
  const router = useRouter();
  const user = getCurrentUser();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rfqs' | 'messages'>('rfqs');

  // Load initial data once on mount
  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/my-account");
      return;
    }
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, router]);

  // Subscribe to real-time message updates via WebSocket (Supabase Realtime)
  useRealtimeMessages({
    userId: user?.id || '',
    enabled: !!user?.id,
    onNewMessage: (newMessage) => {
      console.log('📨 New message received via WebSocket:', newMessage);
      setMessages(prev => [newMessage as any, ...prev]);
    },
    onMessageUpdate: (updatedMessage) => {
      console.log('🔄 Message updated via WebSocket:', updatedMessage);
      setMessages(prev =>
        prev.map(msg => msg.id === updatedMessage.id ? updatedMessage as any : msg)
      );
    },
  });

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [rfqsResponse, messagesResponse] = await Promise.all([
        apiClient.get('/buyer/rfqs').catch(() => ({ data: { data: [] } })),
        apiClient.get('/messages/inbox', { params: { limit: 10 } }).catch(() => ({ data: { data: [] } }))
      ]);

      setRfqs(rfqsResponse.data.data || []);
      setMessages(messagesResponse.data.data || []);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please login to access your account</h1>
          <Link href="/login?redirect=/my-account">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* User Info Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Welcome back, {user.name}!</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{rfqs.length}</p>
                  <p className="text-sm text-blue-700">Total RFQs</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <MessageSquare className="h-8 w-8 text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-900">{messages.length}</p>
                  <p className="text-sm text-green-700">Messages</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <Eye className="h-8 w-8 text-purple-600 mb-2" />
                  <p className="text-2xl font-bold text-purple-900">Active</p>
                  <p className="text-sm text-purple-700">Account Status</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link href="/rfq">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Send className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Post New RFQ</h3>
                      <p className="text-sm text-gray-600">Get quotes from sellers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Browse Products</h3>
                      <p className="text-sm text-gray-600">Explore marketplace</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('rfqs')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'rfqs'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <FileText className="inline h-4 w-4 mr-2" />
                  My RFQs
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'messages'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <MessageSquare className="inline h-4 w-4 mr-2" />
                  Messages
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">Loading...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* RFQs Tab */}
              {activeTab === 'rfqs' && (
                <div className="space-y-4">
                  {rfqs.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No RFQs yet</h3>
                        <p className="text-gray-600 mb-4">Post your first RFQ to get quotes from sellers</p>
                        <Link href="/rfq">
                          <Button>
                            <Send className="h-4 w-4 mr-2" />
                            Post RFQ
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    rfqs.map((rfq) => (
                      <Card key={rfq.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{rfq.title}</h3>
                                <Badge variant={rfq.status === 'open' ? 'success' : 'secondary'}>
                                  {rfq.status}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-3 line-clamp-2">{rfq.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Posted: {new Date(rfq.created_at).toLocaleDateString()}</span>
                                </div>
                                {rfq.deadline && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Deadline: {new Date(rfq.deadline).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Messages Tab */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                        <p className="text-gray-600">Start browsing products to contact sellers</p>
                      </CardContent>
                    </Card>
                  ) : (
                    messages.map((message) => (
                      <Card key={message.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{message.subject}</h3>
                                <Badge variant={message.status === 'unread' ? 'default' : 'secondary'}>
                                  {message.status}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-2">
                                From: {message.sender?.name || 'Unknown'}
                                {message.sender?.company && ` (${message.sender.company})`}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(message.created_at).toLocaleString()}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              View Message
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </StorefrontLayout>
  );
}
