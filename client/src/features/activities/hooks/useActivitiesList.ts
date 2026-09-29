import { useQuery } from '@tanstack/react-query';
import { activitiesApi } from '../api/activitiesApi';
import { activitiesKeys } from '../api/activitiesKeys';
import type { Activity } from '../../../shared';

export interface UseActivitiesListOptions {
  category?: string;
  status?: string;
}

/**
 * useActivitiesList
 * SRP (Single Responsibility Principle):
 * Only handles querying and caching the collection of activities.
 * Does not re-fetch details or perform unrelated mutations.
 */
export function useActivitiesList(filters?: UseActivitiesListOptions) {
  const query = useQuery<Activity[]>({
    queryKey: activitiesKeys.all,
    queryFn: activitiesApi.getAll,
  });

  // Client-side filtering when filters are provided
  const filteredActivities = query.data?.filter((activity) => {
    if (!filters) return true;

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      if (activity.category?.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
    }

    // Filter by status (e.g. going, hosting)
    if (filters.status && filters.status !== 'all') {
      // Future-proofing or checking cancellation status
      if (filters.status === 'hosting' && activity.isCancelled) {
        return false;
      }
    }

    return true;
  });

  return {
    activities: filteredActivities ?? query.data,
    rawActivities: query.data,
    isPending: query.isPending,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useActivitiesList;
