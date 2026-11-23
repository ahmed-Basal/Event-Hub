import { serverFetch } from '@/core/api/serverFetch';
import type { Activity } from '@features/Activities/Frontend';
import HomeClient from '@features/Home/Frontend/components/HomeClient';

export default async function HomePage() {
  const res = await serverFetch<Activity[]>('/activities?pageNumber=1&pageSize=6&sortBy=hot');
  return <HomeClient activities={res?.data ?? []} />;
}
