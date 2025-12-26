import api from '@/lib/axios';

// Interfaces based on backend DTOs (approximate)
export interface User {
  id: string;
  email: string;
  role: string;
  // Add other fields as needed
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
  brandingSettings?: any;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: any;
  createdAt: string;
  actorId?: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  createdAt: string;
}

export interface DashboardStats {
  activeTenants: number;
  totalUsers: number;
  totalRevenue: number;
  systemHealth: string;
}

export const adminService = {
  // Users
  getAllUsers: async (query?: any) => {
    const response = await api.get('/admin/users', { params: query });
    return response.data;
  },
  
  createUser: async (data: any) => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Tenants
  getAllTenants: async (query?: any) => {
    const response = await api.get('/admin/tenants', { params: query });
    return response.data;
  },

  createTenant: async (data: any) => {
    const response = await api.post('/admin/tenants', data);
    return response.data;
  },

  updateTenant: async (id: string, data: any) => {
    const response = await api.put(`/admin/tenants/${id}`, data);
    return response.data;
  },

  updateTenantStatus: async (id: string, status: string) => {
    const response = await api.patch(`/admin/tenants/${id}/status`, { status });
    return response.data;
  },

  deleteTenant: async (id: string) => {
    const response = await api.delete(`/admin/tenants/${id}`);
    return response.data;
  },

  // Payments
  getAllPayments: async (query?: any) => {
    const response = await api.get('/admin/payments', { params: query });
    return response.data;
  },

  // Activity Logs
  getAllActivityLogs: async (query?: any) => {
    const response = await api.get('/admin/activity-logs', { params: query });
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};
