import api from './api';
import {
  OverviewMetrics,
  RiskDistributionItem,
  TrendItem,
  AgeGroupItem,
  GenderDistributionItem,
  ChestPainItem,
} from '../types';

export const analyticsService = {
  getOverview: async (): Promise<OverviewMetrics> => {
    const res = await api.get<OverviewMetrics>('/analytics/overview');
    return res.data;
  },

  getRiskDistribution: async (): Promise<RiskDistributionItem[]> => {
    const res = await api.get<RiskDistributionItem[]>('/analytics/risk-distribution');
    return res.data;
  },

  getTrends: async (): Promise<TrendItem[]> => {
    const res = await api.get<TrendItem[]>('/analytics/trends');
    return res.data;
  },

  getAgeGroups: async (): Promise<AgeGroupItem[]> => {
    const res = await api.get<AgeGroupItem[]>('/analytics/age-groups');
    return res.data;
  },

  getGenderDistribution: async (): Promise<GenderDistributionItem[]> => {
    const res = await api.get<GenderDistributionItem[]>('/analytics/gender-distribution');
    return res.data;
  },

  getChestPainAnalysis: async (): Promise<ChestPainItem[]> => {
    const res = await api.get<ChestPainItem[]>('/analytics/chest-pain');
    return res.data;
  },

  getFeatureImportance: async () => {
    const res = await api.get('/analytics/feature-importance');
    return res.data;
  }
};

