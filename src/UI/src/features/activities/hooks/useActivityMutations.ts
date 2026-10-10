import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi } from '../api/activitiesApi';
import { activitiesKeys } from '../api/activitiesKeys';
import type { Activity, CreateActivityDto, UpdateActivityDto } from '../../../shared';

export function useActivityMutations(activityId?: string) {
  const queryClient = useQueryClient();

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: activitiesKeys.all });
  };

  const createActivity = useMutation({
    mutationFn: (newActivity: CreateActivityDto | Activity) =>
      activitiesApi.create(newActivity),
    onSuccess: () => {
      invalidateLists();
    },
  });

  const updateActivity = useMutation({
    mutationFn: (activityToUpdate: UpdateActivityDto | Activity) =>
      activitiesApi.update(activityToUpdate),
    onSuccess: () => {
      invalidateLists();
      if (activityId) {
        queryClient.invalidateQueries({ queryKey: activitiesKeys.detail(activityId) });
      }
    },
  });

  const deleteActivity = useMutation({
    mutationFn: (id: string) => activitiesApi.delete(id),
    onSuccess: () => {
      invalidateLists();
    },
  });

  return {
    createActivity,
    updateActivity,
    deleteActivity,
    isMutating:
      createActivity.isPending || updateActivity.isPending || deleteActivity.isPending,
  };
}

export default useActivityMutations;
