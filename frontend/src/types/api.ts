// src/types/api.ts

export interface ApiResponse<T> {
  timestamp: string;
  status: number;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
