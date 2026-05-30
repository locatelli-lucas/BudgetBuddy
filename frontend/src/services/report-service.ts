// src/services/report-service.ts
import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface CategoryBreakdown {
  name: string;
  amount: number;
  percentage: number;
}

export interface CashFlowPoint {
  date: string;
  amount: number;
}

export interface MonthlyReportData {
  month: number;
  year: number;
  userName: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  categories: CategoryBreakdown[];
  cashFlow: CashFlowPoint[];
  aiSummary: string;
  recommendations: string[];
}

export interface ApiResponseWrapper<T> {
  timestamp: string;
  status: number;
  data: T;
}

export const reportService = {
  getReportData: async (month?: number, year?: number): Promise<MonthlyReportData> => {
    const now = new Date();
    const params: Record<string, number> = {
      month: month ?? now.getMonth() + 1,
      year: year ?? now.getFullYear(),
    };
    const res = await api.get<ApiResponseWrapper<MonthlyReportData>>('/api/v1/reports/monthly', { params });
    return res.data.data;
  },

  downloadPdf: async (month?: number, year?: number): Promise<string> => {
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    const token = await AsyncStorage.getItem('accessToken');
    const url = `${api.defaults.baseURL}/api/v1/reports/monthly/pdf?month=${targetMonth}&year=${targetYear}`;

    const fileUri = `${FileSystem.cacheDirectory}budgetbuddy-report-${targetMonth}-${targetYear}.pdf`;

    const downloadRes = await FileSystem.downloadAsync(url, fileUri, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return downloadRes.uri;
  },

  sharePdf: async (fileUri: string) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartilhar relatório financeiro',
      });
    }
  },

  saveToDevice: async (fileUri: string, filename: string) => {
    const destination = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.moveAsync({
      from: fileUri,
      to: destination,
    });
    return destination;
  },
};
