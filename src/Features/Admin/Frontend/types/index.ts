export interface AdminUserDto {
  id: string;
  username: string;
  displayName: string;
  email?: string | null;
  roles: string[];
}

export interface AdminOrderDto {
  id: string;
  activityId: string;
  activityTitle: string;
  buyerDisplayName: string;
  buyerEmail?: string | null;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  paidAt?: string | null;
}

export interface AdminActivityDto {
  id: string;
  title: string;
  category: string;
  city: string;
  date: string;
  price: number;
  isCancelled: boolean;
  attendeesCount: number;
  hostDisplayName: string;
}

export interface TrackAnalyticDto {
  track: string;
  eventsCount: number;
  attendeesCount: number;
  revenue: number;
}

export interface AdminDashboardDto {
  kpis: {
    totalRevenue: number;
    paidOrdersCount: number;
    totalUsers: number;
    activeEventsCount: number;
    cancelledEventsCount: number;
  };
  orders: AdminOrderDto[];
  activities: AdminActivityDto[];
  trackAnalytics: TrackAnalyticDto[];
}
