import { agent } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { NotificationsEnvelope } from '../types';

export const notificationsApi = {
  list: async (take = 30) => {
    const res = await agent.get<ApiResponse<NotificationsEnvelope>>('/notifications', {
      params: { take },
    });
    return res.data.data;
  },
  markRead: async (id: string) => {
    const res = await agent.post<ApiResponse<string>>(`/notifications/${id}/read`);
    return res.data.data;
  },
  markAllRead: async () => {
    const res = await agent.post<ApiResponse<number>>('/notifications/read-all');
    return res.data.data;
  },
  createTicket: async () => {
    const res = await agent.post<{ ticket: string }>('/notifications/ticket');
    return res.data.ticket;
  },
};
