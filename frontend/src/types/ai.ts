// src/types/ai.ts

export type InsightType = 'ALERT' | 'RECOMMENDATION' | 'PROGRESS';
export type InsightSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';

export interface AiInsight {
  id: string;
  type: InsightType;
  title: string;
  body: string;
  icon?: string;
  severity: InsightSeverity;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  reply: string;
  timestamp: string;
}

export interface CategorizationRequest {
  description: string;
  amount: number;
}

export interface CategorizationResponse {
  categoryId: string;
  categoryName: string;
  confidence: number;
}
