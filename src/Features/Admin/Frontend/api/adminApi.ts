import { agent } from '@/core/api/client';
import type { AdminDashboardDto, AdminUserDto } from '../types';

export const adminApi = {
  getUsers: async () => {
    const res = await agent.get<{ succeeded: boolean; data: AdminUserDto[] }>('/admin/users');
    return res.data.data;
  },
  updateRoles: async (username: string, roles: string[]) => {
    const res = await agent.post<{ succeeded: boolean; data: string[] }>(
      `/admin/users/${encodeURIComponent(username)}/roles`,
      { roles }
    );
    return res.data.data;
  },
  getDashboard: async () => {
    const res = await agent.get<{ succeeded: boolean; data: AdminDashboardDto }>('/admin/dashboard');
    return res.data.data;
  },
  refundOrder: async (orderId: string) => {
    const res = await agent.post(`/admin/orders/${orderId}/refund`);
    return res.data;
  },
  toggleCancelActivity: async (id: string) => {
    const res = await agent.post<{ succeeded: boolean; isCancelled: boolean }>(
      `/admin/activities/${id}/toggle-cancel`
    );
    return res.data;
  },
  deleteActivity: async (id: string) => {
    const res = await agent.delete(`/admin/activities/${id}`);
    return res.data;
  },
};
