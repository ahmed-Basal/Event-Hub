import type { Metadata } from 'next';
import { serverFetch } from '@/core/api/serverFetch';
import type { Activity } from '@modules/activities';
import ActivityDashboardClient from '@modules/activities/components/ActivityDashboardClient';

export const metadata: Metadata = {
  title: 'Activities',
  description: 'Explore upcoming developer meetups, workshops, and community events on DevMeet.',
};

export default async function ActivitiesPage() {
  const initialData = await serverFetch<Activity[]>('/activities?pageNumber=1&pageSize=6');
  return <ActivityDashboardClient initialData={initialData} />;
}
