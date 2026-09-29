import { useQuery } from '@tanstack/react-query';
import { activitiesApi } from '../api/activitiesApi';
import { activitiesKeys } from '../api/activitiesKeys';
import type { Activity } from '../../../shared';

/**
 * useActivityDetail
 * SRP (Single Responsibility Principle):
 * Only handles fetching and caching an individual activity by ID.
 * Conditional fetching: only triggers when `id` is present.
 */
export function useActivityDetail(id?: string) {
  const query = useQuery<Activity>({
    queryKey: activitiesKeys.detail(id!),
    queryFn: () => activitiesApi.getById(id!),
    enabled: Boolean(id),
  });

  return {
    activity: query.data,
    isLoading: query.isLoading,
    isLoadingActivity: query.isLoading,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useActivityDetail;
