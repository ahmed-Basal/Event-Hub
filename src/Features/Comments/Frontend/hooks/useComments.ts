'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { getStoredUser, HUB_URL } from '@/core/api/client';
import type { ChatComment } from '../types';

export function useComments(activityId: string, enabled: boolean) {
  const [comments, setComments] = useState<ChatComment[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!activityId || !enabled) return;

    const user = getStoredUser();
    const connection = new HubConnectionBuilder()
      .withUrl(`${HUB_URL}?activityId=${encodeURIComponent(activityId)}`, {
        accessTokenFactory: () => user?.token || '',
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on('LoadComments', (loaded: ChatComment[]) => {
      setComments(loaded);
    });

    connection.on('ReceiveComment', (comment: ChatComment) => {
      setComments((prev) => {
        if (prev.some((c) => c.id === comment.id)) return prev;
        return [comment, ...prev];
      });
    });

    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    connection
      .start()
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false));

    connectionRef.current = connection;

    return () => {
      connectionRef.current = null;
      if (connection.state !== HubConnectionState.Disconnected) {
        connection.stop().catch(() => {});
      }
    };
  }, [activityId, enabled]);

  const sendComment = useCallback(
    async (body: string) => {
      const conn = connectionRef.current;
      if (!conn || conn.state !== HubConnectionState.Connected || !body.trim()) return;
      setIsSending(true);
      try {
        await conn.invoke('SendComment', { activityId, body: body.trim() });
      } finally {
        setIsSending(false);
      }
    },
    [activityId]
  );

  return { comments, isConnected, isSending, sendComment };
}
