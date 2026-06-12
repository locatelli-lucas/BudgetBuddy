// src/hooks/usePagination.ts
import { useState, useCallback } from 'react';
import { PageResponse } from '../types/api';

interface UsePaginationOptions<T, F> {
  fetchData: (page: number, size: number, filters?: F) => Promise<PageResponse<T>>;
  initialSize?: number;
  initialFilters?: F;
}

export function usePagination<T, F>({
  fetchData,
  initialSize = 20,
  initialFilters,
}: UsePaginationOptions<T, F>) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<F | undefined>(initialFilters);

  const loadData = useCallback(
    async (targetPage: number, reset = false, currentFilters = filters) => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const response = await fetchData(targetPage, initialSize, currentFilters);
        if (reset) {
          setData(response.content);
        } else {
          setData((prev) => [...prev, ...response.content]);
        }
        setPage(response.number);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Failed to fetch paginated data:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchData, initialSize, filters, isLoading]
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadData(0, true);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadData]);

  const loadMore = useCallback(() => {
    const hasMore = page < totalPages - 1;
    if (hasMore && !isLoading) {
      loadData(page + 1);
    }
  }, [page, totalPages, isLoading, loadData]);

  const applyFilters = useCallback(
    (newFilters: F) => {
      setFilters(newFilters);
      loadData(0, true, newFilters);
    },
    [loadData]
  );

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    loadData(0, true, initialFilters);
  }, [loadData, initialFilters]);

  return {
    data,
    page,
    totalPages,
    isLoading,
    isRefreshing,
    filters,
    refresh,
    loadMore,
    applyFilters,
    resetFilters,
    setData,
  };
}
