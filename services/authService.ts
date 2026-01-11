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
    console.log(`Attempting login for ${email}...`);
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      console.log('Login API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
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
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      // Re-throw with proper error context
      throw {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      };
    }
  }
};
