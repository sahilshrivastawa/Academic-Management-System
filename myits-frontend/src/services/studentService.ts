import api from '../config/api';
import type { Student, StudentRequest, StudentSelfProfileRequest, StudentBulkImportResult, StudentMessage, StudentMessageRequest, StudentAiDashboard, AttendancePredictionRequest, AttendancePrediction, StudentChatbotRequest, StudentChatbotResponse, AcademicPerformanceRequest, AcademicPerformanceResult, ApiResponse } from '../types';

export const studentService = {
  getAll: async (page = 0, size = 10) => {
    const response = await api.get<ApiResponse<Student[]>>(`/students?page=${page}&size=${size}`);
    return response.data;
  },

  getAllDirectoryRecords: async (pageSize = 100, maxPages = 50) => {
    const records: Student[] = [];

    for (let page = 0; page < maxPages; page += 1) {
      const response = await api.get<ApiResponse<Student[]>>(`/students?page=${page}&size=${pageSize}`);
      if (!response.data.success) {
        return response.data;
      }

      const batch = response.data.data ?? [];
      records.push(...batch);

      if (batch.length < pageSize) {
        break;
      }
    }

    return {
      success: true,
      message: 'Students fetched successfully',
      data: records,
    } as ApiResponse<Student[]>;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Student>>(`/students/${id}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get<ApiResponse<Student>>('/students/me');
    return response.data;
  },

  upsertMyProfile: async (data: StudentSelfProfileRequest) => {
    const response = await api.put<ApiResponse<Student>>('/students/me/profile', data);
    return response.data;
  },

  create: async (data: StudentRequest) => {
    const response = await api.post<ApiResponse<Student>>('/students', data);
    return response.data;
  },

  update: async (id: number, data: StudentRequest) => {
    const response = await api.put<ApiResponse<Student>>(`/students/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<string>>(`/students/${id}`);
    return response.data;
  },

  sendMessage: async (data: StudentMessageRequest) => {
    const response = await api.post<ApiResponse<StudentMessage>>('/students/messages', data);
    return response.data;
  },

  getInbox: async () => {
    const response = await api.get<ApiResponse<StudentMessage[]>>('/students/messages/inbox');
    return response.data;
  },

  getAiDashboard: async () => {
    const response = await api.get<ApiResponse<StudentAiDashboard>>('/students/ai-dashboard');
    return response.data;
  },

  predictAttendance: async (data: AttendancePredictionRequest) => {
    const response = await api.post<ApiResponse<AttendancePrediction>>('/students/attendance/predict', data);
    return response.data;
  },

  askChatbot: async (data: StudentChatbotRequest) => {
    const response = await api.post<ApiResponse<StudentChatbotResponse>>('/students/chatbot/ask', data);
    return response.data;
  },

  analyzePerformance: async (data: AcademicPerformanceRequest) => {
    const response = await api.post<ApiResponse<AcademicPerformanceResult>>('/students/performance/analyze', data);
    return response.data;
  },

  bulkImport: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ApiResponse<StudentBulkImportResult>>('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
