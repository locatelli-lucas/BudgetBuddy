import { api } from './api';
import { GroupedFinancialResources, FinancialResource, FinancialResourceRequest } from '../types/financialResource';

export const financialResourceService = {
  getAll: async () => {
    const { data } = await api.get('/api/v1/financial-resources');
    return data.data as FinancialResource[];
  },

  getGrouped: async () => {
    const { data } = await api.get('/api/v1/financial-resources/grouped');
    return data.data as GroupedFinancialResources;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/api/v1/financial-resources/${id}`);
    return data.data as FinancialResource;
  },

  create: async (request: FinancialResourceRequest) => {
    const { data } = await api.post('/api/v1/financial-resources', request);
    return data.data as FinancialResource;
  },

  update: async (id: string, request: FinancialResourceRequest) => {
    const { data } = await api.put(`/api/v1/financial-resources/${id}`, request);
    return data.data as FinancialResource;
  },

  delete: async (id: string) => {
    await api.delete(`/api/v1/financial-resources/${id}`);
  }
};
