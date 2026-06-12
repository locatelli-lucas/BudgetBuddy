// src/types/investment.ts

export type InvestmentType = 'STOCK' | 'FII' | 'ETF' | 'FIXED_INCOME' | 'CRYPTO';

export interface Investment {
  id: string;
  ticker: string;
  name: string;
  type: InvestmentType;
  quantity: number;
  avgPrice: number;
  purchaseDate: string; // ISO date string YYYY-MM-DD
  currentPrice?: number;
  currentValue?: number;
  returnPercent?: number;
  institutionId?: string; // Optional reference to registered institutions
}

export interface InvestmentRequest {
  ticker: string;
  name: string;
  type: InvestmentType;
  quantity: number;
  avgPrice: number;
  purchaseDate: string;
  institutionId?: string;
}

export interface InvestmentDashboard {
  totalInvested: number;
  currentTotalValue: number;
  netProfitLoss: number;
  returnPercent: number;
}

// User-defined registered investment broker/institutions (User requested A: add backend Institution entity)
export interface Institution {
  id: string;
  name: string;
  brokerCode?: string;
  logoUrl?: string;
}

export interface InstitutionRequest {
  name: string;
  brokerCode?: string;
}
