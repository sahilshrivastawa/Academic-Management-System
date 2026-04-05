import api from '../config/api';
import type { FacultyBulkImportResult, FacultyDirectory } from '../types';

export const facultyService = {
  getAll: async () => {
    const response = await api.get<FacultyDirectory[]>('/faculty/directory');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<FacultyDirectory>(`/faculty/${id}`);
    return response.data;
  },

  importBulk: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<FacultyBulkImportResult>('/faculty/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
