import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { activitiesApi } from '../api/activitiesApi';
import { activitiesKeys } from '../api/activitiesKeys';
import type { Activity } from '../../../shared';

export interface UseInfiniteActivitiesOptions {
  category?: string;
  status?: string;
  date?: Date | string;
  pageSize?: number;
}

export function useInfiniteActivitiesList(filters?: UseInfiniteActivitiesOptions) {
  const pageSize = filters?.pageSize ?? 6;
  const categoryFilter = filters?.category && filters.category !== 'all' ? filters.category : undefined;
  const statusFilter = filters?.status && filters.status !== 'all' ? filters.status : undefined;

  const dateParam = useMemo(() => {
    if (!filters?.date) return undefined;
    if (filters.date instanceof Date) {
      const year = filters.date.getFullYear();
      const month = String(filters.date.getMonth() + 1).padStart(2, '0');
      const day = String(filters.date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return String(filters.date).split('T')[0];
  }, [filters?.date]);

  const query = useInfiniteQuery({
    queryKey: [...activitiesKeys.lists(), 'infinite', { category: categoryFilter, status: statusFilter, date: dateParam, pageSize }],
    queryFn: async ({ pageParam = 1 }) => {
      return await activitiesApi.getPaged({
        pageNumber: pageParam,
        pageSize,
        category: categoryFilter,
        status: statusFilter,
        date: dateParam,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.hasNextPage) {
        return lastPage.meta.pageNumber + 1;
      }
      return undefined;
    },
  });

  const activities = useMemo<Activity[]>(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap((page) => page.items);
  }, [query.data]);

  const totalCount = query.data?.pages[0]?.meta?.totalCount;

  return {
    activities,
    totalCount,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    isError: query.isError,
    error: query.error,
  };
}

export default useInfiniteActivitiesList;
