import { cookies } from 'next/headers';
import type { ApiResponse } from '@/core/api/types';

const INTERNAL_API =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://localhost:7223/api';

/**
 * Server-side fetch helper for Next.js App Router Server Components (SSR).
 * Uses short revalidation for public anonymous requests and no-store for personalized requests.
 */
export async function serverFetch<T>(path: string): Promise<ApiResponse<T> | null> {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwtToken')?.value;

    const headers: HeadersInit = {
      Accept: 'application/json',
    };
    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
      headers.Cookie = `jwtToken=${jwt}`;
    }

    const res = await fetch(`${INTERNAL_API}${path}`, {
      headers,
      signal: AbortSignal.timeout(4000),
      ...(jwt ? { cache: 'no-store' as const } : { next: { revalidate: 15 } }),
    });

    if (!res.ok) return null;
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}
