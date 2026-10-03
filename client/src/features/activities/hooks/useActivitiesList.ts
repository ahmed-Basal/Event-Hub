import { useQuery } from '@tanstack/react-query';
import { activitiesApi } from '../api/activitiesApi';
import { activitiesKeys } from '../api/activitiesKeys';
import type { Activity } from '../../../shared';

export interface UseActivitiesListOptions {
  category?: string;
  status?: string;
}

export function useActivitiesList(filters?: UseActivitiesListOptions) {
  const query = useQuery<Activity[]>({
    queryKey: activitiesKeys.all,
    queryFn: activitiesApi.getAll,
  });

  const filteredActivities = query.data?.filter((activity) => {
    if (!filters) return true;

    if (filters.category && filters.category !== 'all') {
      if (activity.category?.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
    }

    if (filters.status && filters.status !== 'all') {

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
