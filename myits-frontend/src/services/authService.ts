import api from '../config/api';
import type { LoginRequest, RegisterRequest, AuthResponse, ResetPasswordRequest, OtpSendRequest, OtpSendResponse, ApiResponse } from '../types';

export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await api.post<ApiResponse<string>>('/auth/reset-password', data);
    return response.data;
  },

  sendOtp: async (data: OtpSendRequest) => {
    const response = await api.post<ApiResponse<OtpSendResponse>>('/auth/send-otp', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
