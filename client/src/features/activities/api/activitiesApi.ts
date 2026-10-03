import { axiosClient } from '../../../shared';
import type { Activity, CreateActivityDto, UpdateActivityDto } from '../../../shared';

export const activitiesApi = {

  getAll: async (): Promise<Activity[]> => {
    const response = await axiosClient.get<Activity[]>('/activities');
    return response.data;
  },

  getById: async (id: string): Promise<Activity> => {
    const response = await axiosClient.get<Activity>(`/activities/${id}`);
    return response.data;
  },

  /**
   * Create a new activity
   */
  create: async (activity: CreateActivityDto | Partial<Activity>): Promise<string> => {
    const response = await axiosClient.post<string>('/activities', activity);
    return response.data;
  },

  /**
   * Update an existing activity
   */
  update: async (activity: UpdateActivityDto | Activity): Promise<void> => {
    const response = await axiosClient.put(`/activities/${activity.id}`, activity);
    return response.data;
  },

  /**
   * Delete an activity by ID
   */
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/activities/${id}`);
  },
};
