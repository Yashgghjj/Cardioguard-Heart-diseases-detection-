import api from './api';
import { Assessment } from '../types';

export interface AssessmentListResponse {
  total: number;
  page: number;
  limit: number;
  items: Assessment[];
}

export interface NewAssessmentPayload {
  patient_id?: number;
  patient_name?: string;
  age: number;
  sex: number;
  cp: number;
  trestbps: number;
  chol: number;
  fbs: number;
  restecg: number;
  thalach: number;
  exang: number;
  oldpeak: number;
  slope: number;
  ca: number;
  thal: number;
  clinical_notes?: string;
}

export const predictionService = {
  create: async (data: NewAssessmentPayload): Promise<Assessment> => {
    const res = await api.post<Assessment>('/predictions', data);
    return res.data;
  },

  list: async (params?: { patient_id?: number; risk_level?: string; search?: string; sort_by?: string; order?: string; page?: number; limit?: number }) => {
    const res = await api.get<AssessmentListResponse>('/predictions', { params });
    return res.data;
  },

  get: async (id: number): Promise<Assessment> => {
    const res = await api.get<Assessment>(`/predictions/${id}`);
    return res.data;
  },

  downloadPdfReport: async (id: number, reference: string) => {
    const res = await api.get(`/predictions/${id}/report`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CardioGuard_Report_${reference}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportCsv: async () => {
    const res = await api.get('/predictions/export/csv', {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cardioguard_assessments_export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

