import api from '../config/api';
import type { Guest, GuestRequest, ApiResponse } from '../types';

export const guestService = {
  getAll: async (page = 0, size = 10, date?: string) => {
    let url = `/guests?page=${page}&size=${size}`;
    if (date) {
      url += `&date=${date}`;
    }
    const response = await api.get<ApiResponse<Guest[]>>(url);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Guest>>(`/guests/${id}`);
    return response.data;
  },

  create: async (data: GuestRequest) => {
    const response = await api.post<ApiResponse<Guest>>('/guests', data);
    return response.data;
  },

  update: async (id: number, data: GuestRequest) => {
    const response = await api.put<ApiResponse<Guest>>(`/guests/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<string>>(`/guests/${id}`);
    return response.data;
  },
};
