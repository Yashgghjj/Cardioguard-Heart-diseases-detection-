import api from './api';
import { Patient } from '../types';

export interface PatientListResponse {
  total: number;
  page: number;
  limit: number;
  items: Patient[];
}

export const patientService = {
  list: async (params?: { search?: string; min_age?: number; max_age?: number; gender?: string; page?: number; limit?: number }) => {
    const res = await api.get<PatientListResponse>('/patients', { params });
    return res.data;
  },

  get: async (id: number) => {
    const res = await api.get<Patient & { assessments: any[] }>(`/patients/${id}`);
    return res.data;
  },

  create: async (data: Omit<Patient, 'id' | 'patient_code' | 'created_at' | 'updated_at'>) => {
    const res = await api.post<Patient>('/patients', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Patient>) => {
    const res = await api.put<Patient>(`/patients/${id}`, data);
    return res.data;
  },

  delete: async (id: number) => {
    await api.delete(`/patients/${id}`);
  }
};

