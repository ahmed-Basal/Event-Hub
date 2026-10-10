import { axiosClient } from '../../../shared';
import type { Activity, CreateActivityDto, UpdateActivityDto } from '../../../shared';

/**
 * Technical events and meetups API service client.
 * Dispatches requests to the ASP.NET Core `/api/activities` endpoints and unwraps the response envelope.
 */
export const activitiesApi = {
  /**
   * Fetches all scheduled technical events and conferences.
   * @returns {Promise<Activity[]>} Resolves to an array of technical activity domain entities.
   */
  getAll: async (): Promise<Activity[]> => {
    const response = await axiosClient.get<any>('/activities');
    return response.data?.data ?? response.data;
  },

  /**
   * Retrieves single activity details by unique identifier (GUID) or SEO slug.
   * @param {string} id - The GUID or slug of the targeted activity.
   * @returns {Promise<Activity>} Resolves to the complete activity record with attendees and coordinates.
   */
  getById: async (id: string): Promise<Activity> => {
    const response = await axiosClient.get<any>(`/activities/${id}`);
    return response.data?.data ?? response.data;
  },

  /**
   * Publishes a new technical meetup to the platform.
   * @param {CreateActivityDto | Partial<Activity>} activity - The event payload.
   * @returns {Promise<string>} Resolves to the unique identifier (GUID) of the newly created activity.
   */
  create: async (activity: CreateActivityDto | Partial<Activity>): Promise<string> => {
    const response = await axiosClient.post<any>('/activities', activity);
    return response.data?.data ?? response.data;
  },

  /**
   * Updates an existing technical event's details.
   * @param {UpdateActivityDto | Activity} activity - The updated event payload including ID.
   * @returns {Promise<void>} Resolves when the update is committed on the server.
   */
  update: async (activity: UpdateActivityDto | Activity): Promise<void> => {
    const response = await axiosClient.put(`/activities/${activity.id}`, activity);
    return response.data?.data ?? response.data;
  },

  /**
   * Permanently deletes a technical event record by its ID.
   * @param {string} id - Unique identifier of the activity to remove.
   * @returns {Promise<void>} Resolves when deletion succeeds.
   */
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/activities/${id}`);
  },
};
