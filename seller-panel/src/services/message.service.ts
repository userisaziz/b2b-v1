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

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCategory = async (id: string) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (data: any) => {
  const response = await api.post('/categories', data);
  return response.data;
};

export const updateCategory = async (id: string, data: any) => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// Message services
export const getInbox = async () => {
  const response = await api.get('/messages/inbox');
  return response.data;
};

export const getSent = async () => {
  const response = await api.get('/messages/sent');
  return response.data;
};

export const sendMessage = async (data: any) => {
  const response = await api.post('/messages/send', data);
  return response.data;
};

export const markAsRead = async (id: string) => {
  const response = await api.put(`/messages/${id}/read`);
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/messages/unread/count');
  return response.data;
};

// Get conversation with a participant
export const getConversation = async (participant_id: string, participant_type: 'Buyer' | 'Seller') => {
  const response = await api.get(`/messages/conversation/${participant_id}/${participant_type}`);
  return response.data;
};