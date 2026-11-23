import { agent } from '@/core/api/client';
import type { CheckoutSessionResult } from '../types';

export interface OrderStatusResult {
  orderId: string;
  activityId: string;
  status: string;
  isPaid: boolean;
  paidAt?: string | null;
}

export const paymentsApi = {
  checkout: async (activityId: string, idempotencyKey?: string) => {
    const key = idempotencyKey || crypto.randomUUID();
    const res = await agent.post<{ succeeded: boolean; data: CheckoutSessionResult }>(
      `/payments/checkout/${activityId}`,
      null,
      {
        headers: {
          'Idempotency-Key': key,
        },
      }
    );
    return res.data.data;
  },
  sandboxComplete: async (orderId: string) => {
    const res = await agent.post(`/payments/sandbox-complete/${orderId}`);
    return res.data;
  },
  getOrderStatus: async (orderId: string) => {
    const res = await agent.get<{ succeeded: boolean; data: OrderStatusResult }>(
      `/payments/orders/${encodeURIComponent(orderId)}/status`
    );
    return res.data.data;
  },
};
