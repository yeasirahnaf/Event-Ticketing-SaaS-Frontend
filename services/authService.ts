import api from '@/lib/axios';

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string | null;
    tenantId?: string;
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (data: any): Promise<any> => {
    const response = await api.post('/admin/register', data);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout failed', e);
    }
  },

  checkAuth: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
