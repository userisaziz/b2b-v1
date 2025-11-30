import api from './api';

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

export interface SendMessageParams {
  recipient_id: string;
  subject: string;
  message: string;
  message_type: string;
  recipient_type: 'Buyer' | 'Seller';
}

// Send a message
export const sendMessage = async (messageData: SendMessageParams) => {
  const response = await api.post('/messages/send', messageData);
  return response.data;
};

// Get inbox messages
export const getInbox = async (params?: { limit?: number; offset?: number }) => {
  const response = await api.get('/messages/inbox', { params });
  return response.data;
};

// Get sent messages
export const getSent = async (params?: { limit?: number; offset?: number }) => {
  const response = await api.get('/messages/sent', { params });
  return response.data;
};

// Get a specific message
export const getMessage = async (id: string) => {
  const response = await api.get(`/messages/${id}`);
  return response.data;
};

// Mark message as read
export const markAsRead = async (id: string) => {
  const response = await api.put(`/messages/${id}/read`);
  return response.data;
};

// Get unread message count
export const getUnreadCount = async () => {
  const response = await api.get('/messages/unread/count');
  return response.data;
};