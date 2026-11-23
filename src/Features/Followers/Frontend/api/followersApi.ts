import { agent } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { UserProfile } from '@features/Profiles/Frontend/types';

export const followersApi = {
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
