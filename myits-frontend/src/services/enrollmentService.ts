import api from '../config/api';
import type { Enrollment, EnrollmentRequest, StudentCourseView, ApiResponse } from '../types';

export const enrollmentService = {
  getAll: async (page = 0, size = 10) => {
    const response = await api.get<ApiResponse<Enrollment[]>>(`/enrollments?page=${page}&size=${size}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Enrollment>>(`/enrollments/${id}`);
    return response.data;
  },

  getByStudent: async (studentId: number) => {
    const response = await api.get<ApiResponse<StudentCourseView[]>>(`/enrollments/student/${studentId}`);
    return response.data;
  },

  getByCourse: async (courseId: number) => {
    const response = await api.get<ApiResponse<StudentCourseView[]>>(`/enrollments/course/${courseId}`);
    return response.data;
  },

  create: async (data: EnrollmentRequest) => {
    const response = await api.post<ApiResponse<Enrollment>>('/enrollments', data);
    return response.data;
  },

  update: async (id: number, data: EnrollmentRequest) => {
    const response = await api.put<ApiResponse<Enrollment>>(`/enrollments/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<string>>(`/enrollments/${id}`);
    return response.data;
  },
};
