import { api } from './api';
import { InstallmentPurchase, InstallmentPurchaseRequest } from '../types/financialResource';

export const installmentService = {
  getAll: async () => {
    const { data } = await api.get('/api/v1/installments');
    return data.data as InstallmentPurchase[];
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/api/v1/installments/${id}`);
    return data.data as InstallmentPurchase;
  },

  create: async (request: InstallmentPurchaseRequest) => {
    const { data } = await api.post('/api/v1/installments', request);
    return data.data as InstallmentPurchase;
  }
};
