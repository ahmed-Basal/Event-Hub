import type { Metadata } from 'next';
import { serverFetch } from '@/core/api/serverFetch';
import type { UserProfile } from '@modules/profiles';
import ProfilePageClient from '@modules/profiles/components/ProfilePageClient';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const res = await serverFetch<UserProfile>(`/profiles/${username}`);
  return {
    title: res?.data?.displayName || username,
    description: res?.data?.bio || `${username}'s DevMeet profile`,
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const res = await serverFetch<UserProfile>(`/profiles/${username}`);
  return <ProfilePageClient username={username} initialProfile={res?.data ?? null} />;
}
