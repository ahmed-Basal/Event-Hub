import { cookies } from 'next/headers';
import type { ApiResponse } from '@/core/api/types';
import {
  type BffSessionData,
  decryptPayload,
  getInternalApiUrl,
  refreshSessionIfNeeded,
  SESSION_COOKIE_NAME,
} from '@/core/auth/bffSession';

/**
 * Server-side fetch helper for Next.js App Router Server Components (SSR).
 * Uses short revalidation for public anonymous requests and no-store for personalized requests.
 */
export async function serverFetch<T>(path: string): Promise<ApiResponse<T> | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const legacyJwt = cookieStore.get('jwtToken')?.value;

    let accessToken: string | undefined = legacyJwt;

    if (sessionCookie) {
      const parsed = decryptPayload<BffSessionData>(sessionCookie);
      if (parsed) {
        const active = await refreshSessionIfNeeded(parsed);
        if (active?.session.accessToken) {
          accessToken = active.session.accessToken;
        }
      }
    }

    const headers: HeadersInit = {
      Accept: 'application/json',
    };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
      if (legacyJwt && accessToken === legacyJwt) {
        headers.Cookie = `jwtToken=${legacyJwt}`;
      }
    }

    const res = await fetch(`${getInternalApiUrl()}${path}`, {
      headers,
      signal: AbortSignal.timeout(4000),
      ...(accessToken ? { cache: 'no-store' as const } : { next: { revalidate: 15 } }),
    });

    if (!res.ok) return null;
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}
