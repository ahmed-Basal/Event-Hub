import { useQuery } from '@tanstack/react-query';
import { homeApi, homeKeys } from '../api';
import type { HomePageData } from '../types';

export function useHomeData() {
  const query = useQuery<HomePageData>({
    queryKey: homeKeys.pageData(),
    queryFn: homeApi.getPageData,
  });

  return {
    featuredActivity: query.data?.featuredActivity ?? undefined,
    upcomingActivities: query.data?.upcomingActivities ?? [],
    stats: query.data?.stats,
    isPending: query.isPending,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
