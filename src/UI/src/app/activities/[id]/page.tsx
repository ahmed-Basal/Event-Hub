import type { Metadata } from 'next';
import { serverFetch } from '@/core/api/serverFetch';
import type { Activity } from '@features/Activities/Frontend';
import ActivityDetailsClient from '@features/Activities/Frontend/components/ActivityDetailsClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const res = await serverFetch<Activity>(`/activities/${id}`);
  if (!res?.data) {
    return { title: 'Activity Details' };
  }
  return {
    title: res.data.title,
    description: res.data.description,
  };
}

export default async function ActivityDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const res = await serverFetch<Activity>(`/activities/${id}`);
  return <ActivityDetailsClient activityId={id} initialActivity={res?.data ?? null} />;
}
