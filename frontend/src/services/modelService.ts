import api from './api';
import { ModelMetadata, ModelComparisonItem } from '../types';

export const modelService = {
  getModelInfo: async (): Promise<ModelMetadata> => {
    const res = await api.get<ModelMetadata>('/model/info');
    return res.data;
  },

  getModelMetrics: async () => {
    const res = await api.get('/model/metrics');
    return res.data;
  },

  getModelComparison: async (): Promise<ModelComparisonItem[]> => {
    const res = await api.get<ModelComparisonItem[]>('/model/comparison');
    return res.data;
  }
};

