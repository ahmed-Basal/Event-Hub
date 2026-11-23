import type { Metadata } from 'next';
import ActivityFormClient from '@features/Activities/Frontend/components/ActivityFormClient';

export const metadata: Metadata = {
  title: 'Create Activity',
};

export default function CreateActivityPage() {
  return <ActivityFormClient />;
}
