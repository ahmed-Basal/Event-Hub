import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import agent from '../Api/agent';
import type { Activity } from '../Types';

export function useActivities(id?: string) {
  const queryClient = useQueryClient();

  const { data: activities, isPending } = useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: async () => {
      const response = await agent.get<Activity[]>('/activities');
      return response.data;
    },
  });

  const { data: activity, isLoading: isLoadingActivity } = useQuery<Activity>({
    queryKey: ['selectedActivity', id],
    queryFn: async () => {
      const response = await agent.get<Activity>(`/activities/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });

  const updateActivity = useMutation({
    mutationFn: async (activityToUpdate: Activity) => {
      const response = await agent.put(`/activities/${activityToUpdate.id}`, activityToUpdate);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['selectedActivity', id] });
      }
    },
  });

  const deleteActivity = useMutation({
    mutationFn: async (activityId: string) => {
      await agent.delete(`/activities/${activityId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  const createActivity = useMutation({
    mutationFn: async (newActivity: Activity) => {
      const response = await agent.post<string>('/activities', newActivity);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  return {
    activities,
    isPending,
    updateActivity,
    deleteActivity,
    createActivity,
    activity,
    isLoadingActivity,
  };
}

// Backward-compatible alias
export const useactivites = useActivities;
export default useActivities;
