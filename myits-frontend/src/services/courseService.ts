import api from '../config/api';
import type { Course, CourseRequest, ApiResponse } from '../types';

export const courseService = {
  getAll: async (page = 0, size = 10) => {
    const response = await api.get<ApiResponse<Course[]>>(`/courses?page=${page}&size=${size}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data;
  },

  create: async (data: CourseRequest) => {
    const response = await api.post<ApiResponse<Course>>('/courses', data);
    return response.data;
  },

  update: async (id: number, data: CourseRequest) => {
    const response = await api.put<ApiResponse<Course>>(`/courses/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<string>>(`/courses/${id}`);
    return response.data;
  },
};
