import api from './api';

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  pendingRFQs: number;
  totalRevenue: number;
  recentProducts: any[];
  recentOrders: any[];
}

// Get dashboard statistics for the logged-in seller
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/dashboard/stats');
  return response.data.stats;
};

// Get recent activity for the logged-in seller
export const getRecentActivity = async (): Promise<any> => {
  const response = await api.get('/dashboard/recent');
  return response.data;
};