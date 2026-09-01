// src/services/report-service.ts
import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
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
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
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
  getReportData: async (month?: number, year?: number, startDate?: string, endDate?: string): Promise<MonthlyReportData> => {
    const params: Record<string, any> = {};
    if (month) params.month = month;
    if (year) params.year = year;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    if (Object.keys(params).length === 0) {
      const now = new Date();
      params.month = now.getMonth() + 1;
      params.year = now.getFullYear();
    }

    const res = await api.get<ApiResponseWrapper<MonthlyReportData>>('/api/v1/reports/monthly', { params });
    return res.data.data;
  },

  downloadPdf: async (
    month?: number,
    year?: number,
    options: {
      includeCharts: boolean;
      includeAi: boolean;
      includeCategories: boolean;
      includeComparison: boolean;
      startDate?: string;
      endDate?: string;
    } = {
      includeCharts: true,
      includeAi: true,
      includeCategories: true,
      includeComparison: false
    }
  ): Promise<string> => {
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    const token = await AsyncStorage.getItem('accessToken');
    let url = `${api.defaults.baseURL}/api/v1/reports/monthly/pdf?month=${targetMonth}&year=${targetYear}&includeCharts=${options.includeCharts}&includeAi=${options.includeAi}&includeCategories=${options.includeCategories}&includeComparison=${options.includeComparison}`;

    if (options.startDate && options.endDate) {
      url += `&startDate=${options.startDate}&endDate=${options.endDate}`;
    }

    // On web, fetch the PDF as a blob and create a download
    if (Platform.OS === 'web') {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      return blobUrl;
    }

    // On native, download to cache
    const fileUri = `${FileSystem.cacheDirectory}budgetbuddy-report-${targetMonth}-${targetYear}.pdf`;
    await FileSystem.downloadAsync(url, fileUri, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return fileUri;
  },

  sharePdf: async (fileUri: string) => {
    if (Platform.OS === 'web') {
      // Web: trigger browser download
      const a = document.createElement('a');
      a.href = fileUri;
      a.download = `BudgetBuddy_Relatorio.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(fileUri);
      return;
    }

    // Native: use share sheet
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartilhar relatório financeiro',
      });
    }
  },

  saveToDevice: async (fileUri: string, filename: string) => {
    if (Platform.OS === 'web') {
      // Web: trigger browser download with the given filename
      const a = document.createElement('a');
      a.href = fileUri;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(fileUri);
      return;
    }

    // Native: move from cache to documents directory
    const destination = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.moveAsync({ from: fileUri, to: destination });
  },
};
