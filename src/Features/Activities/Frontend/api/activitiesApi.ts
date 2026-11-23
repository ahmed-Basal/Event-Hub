import { agent } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { Activity, ActivityQueryParams, CreateActivityPayload } from '../types';

export const activitiesApi = {
  list: async (params?: ActivityQueryParams) => {
    const res = await agent.get<ApiResponse<Activity[]>>('/activities', { params });
    return res.data;
  },
  details: async (id: string) => {
    const res = await agent.get<ApiResponse<Activity>>(`/activities/${id}`);
    return res.data.data;
  },
  create: async (payload: CreateActivityPayload) => {
    const res = await agent.post<ApiResponse<string>>('/activities', payload);
    return res.data.data;
  },
  update: async (id: string, payload: Partial<CreateActivityPayload>) => {
    const res = await agent.put<ApiResponse<string>>(`/activities/${id}`, payload);
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await agent.delete<ApiResponse<string>>(`/activities/${id}`);
    return res.data;
  },
  attend: async (id: string) => {
    const res = await agent.post<ApiResponse<string>>(`/activities/${id}/attend`);
    return res.data.data;
  },
};
