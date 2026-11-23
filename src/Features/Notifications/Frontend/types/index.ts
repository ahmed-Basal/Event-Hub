export interface NotificationItem {
  id: string;
  type:
    | 'ActivityJoined'
    | 'ActivityLeft'
    | 'ActivityCancelled'
    | 'ActivityReactivated'
    | 'NewComment'
    | 'NewFollower'
    | 'TicketPurchased'
    | string;
  message: string;
  targetUrl?: string | null;
  actorUsername?: string | null;
  actorDisplayName?: string | null;
  actorImage?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsEnvelope {
  unreadCount: number;
  items: NotificationItem[];
}
