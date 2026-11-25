import type { Metadata } from 'next';
import ActivityFormClient from '@modules/activities/components/ActivityFormClient';

export const metadata: Metadata = {
  title: 'Create Activity',
};

export default function CreateActivityPage() {
  return <ActivityFormClient />;
}
