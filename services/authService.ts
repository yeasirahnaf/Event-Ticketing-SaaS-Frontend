import api from '@/lib/axios';

export interface LoginResponse {
  message: string;
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
    // Ideally call backend logout endpoint to clear cookie
    // For now, we can just reload or redirect, but since we use HttpOnly cookie, 
    // we should have a logout endpoint. 
    // Assuming backend doesn't have logout yet, we just handle client side.
    // To properly logout with HttpOnly cookies, we need a backend endpoint that clears the cookie.
    try {
        // await api.post('/auth/logout'); // If exists
    } catch (e) {
        console.error(e);
    }
  }
};
