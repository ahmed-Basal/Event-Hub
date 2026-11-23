'use client';

import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { API_URL } from '@/core/api/client';
import { notificationsApi } from '../api/notificationsApi';
import type { NotificationItem, NotificationsEnvelope } from '../types';

export const NOTIFICATIONS_KEY = ['notifications'] as const;

export function useNotifications(enabled: boolean) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = useQuery<NotificationsEnvelope>({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => notificationsApi.list(30),
    enabled,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const connectSse = async () => {
      if (cancelled) return;
      try {
        const ticket = await notificationsApi.createTicket();
        if (cancelled) return;

        const streamUrl = `${API_URL}/notifications/stream?ticket=${encodeURIComponent(ticket)}`;
        const es = new EventSource(streamUrl, { withCredentials: true });
        eventSourceRef.current = es;

        es.addEventListener('notification', (event) => {
          try {
            const incoming = JSON.parse((event as MessageEvent).data) as NotificationItem;
            queryClient.setQueryData<NotificationsEnvelope>(NOTIFICATIONS_KEY, (prev) => {
              const items = prev?.items ?? [];
              if (items.some((i) => i.id === incoming.id)) return prev!;
              return {
                unreadCount: (prev?.unreadCount ?? 0) + 1,
                items: [incoming, ...items].slice(0, 50),
              };
            });
            toast.info(incoming.message, { autoClose: 4500 });
          } catch {
            // ignore malformed frame
          }
        });

        es.onerror = () => {
          es.close();
          eventSourceRef.current = null;
          if (!cancelled) {
            reconnectTimerRef.current = setTimeout(connectSse, 4000);
          }
        };
      } catch {
        if (!cancelled) {
          reconnectTimerRef.current = setTimeout(connectSse, 8000);
        }
      }
    };

    connectSse();

    return () => {
      cancelled = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [enabled, queryClient]);

  const markRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: (id) => {
      queryClient.setQueryData<NotificationsEnvelope>(NOTIFICATIONS_KEY, (prev) => {
        if (!prev) return prev;
        const target = prev.items.find((i) => i.id === id);
        const wasUnread = target && !target.isRead;
        return {
          unreadCount: Math.max(0, prev.unreadCount - (wasUnread ? 1 : 0)),
          items: prev.items.map((i) => (i.id === id ? { ...i, isRead: true } : i)),
        };
      });
    },
  });

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.setQueryData<NotificationsEnvelope>(NOTIFICATIONS_KEY, (prev) => {
        if (!prev) return prev;
        return {
          unreadCount: 0,
          items: prev.items.map((i) => ({ ...i, isRead: true })),
        };
      });
    },
  });

  return {
    notifications: query.data?.items ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    markRead,
    markAllRead,
  };
}
