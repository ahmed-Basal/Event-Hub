import { agent } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { Photo, UserActivity, UserProfile } from '../types';

export const profilesApi = {
  get: async (username: string) => {
    const res = await agent.get<ApiResponse<UserProfile>>(`/profiles/${username}`);
    return res.data.data;
  },
  edit: async (payload: { displayName: string; bio?: string }) => {
    const res = await agent.put<ApiResponse<string>>('/profiles', payload);
    return res.data.data;
  },
  activities: async (username: string, predicate: 'future' | 'past' | 'hosting') => {
    const res = await agent.get<ApiResponse<UserActivity[]>>(
      `/profiles/${username}/activities`,
      { params: { predicate } }
    );
    return res.data.data;
  },
  uploadPhoto: async (file: Blob) => {
    const formData = new FormData();
    formData.append('file', file, 'avatar.jpg');
    const res = await agent.post<ApiResponse<Photo>>('/profiles/add-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
  deletePhoto: async (photoId: string) => {
    const res = await agent.delete<ApiResponse<string>>(`/profiles/${encodeURIComponent(photoId)}/photos`);
    return res.data;
  },
  setMainPhoto: async (photoId: string) => {
    const res = await agent.put<ApiResponse<string>>(`/profiles/${encodeURIComponent(photoId)}/setMain`);
    return res.data.data;
  },
  followToggle: async (username: string) => {
    const res = await agent.post<ApiResponse<boolean>>(`/profiles/${username}/follow`);
    return res.data.data;
  },
  followList: async (username: string, predicate: 'followers' | 'followings') => {
    const res = await agent.get<ApiResponse<UserProfile[]>>(
      `/profiles/${username}/follow-list`,
      { params: { predicate } }
    );
    return res.data.data;
  },
};
