import type { Metadata } from 'next';
import ActivityFormClient from '@features/Activities/Frontend/components/ActivityFormClient';

export const metadata: Metadata = {
  title: 'Manage Activity',
};

export default async function ManageActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ActivityFormClient activityId={id} />;
}
