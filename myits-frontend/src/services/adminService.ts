import api from '../config/api';
import type { Admin, AdminRequest, ApiResponse } from '../types';

export const adminService = {
  getAll: async (page = 0, size = 10) => {
    const response = await api.get<ApiResponse<Admin[]>>(`/admins?page=${page}&size=${size}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Admin>>(`/admins/${id}`);
    return response.data;
  },

  create: async (data: AdminRequest) => {
    const response = await api.post<ApiResponse<Admin>>('/admins', data);
    return response.data;
  },

  update: async (id: number, data: AdminRequest) => {
    const response = await api.put<ApiResponse<Admin>>(`/admins/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<string>>(`/admins/${id}`);
    return response.data;
  },
};
