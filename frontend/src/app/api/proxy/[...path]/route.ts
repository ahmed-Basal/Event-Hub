import { NextRequest, NextResponse } from 'next/server';
import {
  type BffSessionData,
  decryptPayload,
  getInternalApiUrl,
  getPublicOrigin,
  refreshSessionIfNeeded,
  SESSION_COOKIE_NAME,
  setSessionCookie,
} from '@/core/auth/bffSession';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function handleProxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const targetUrl = `${getInternalApiUrl()}/${path.join('/')}${request.nextUrl.search}`;

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let activeSession: BffSessionData | null = null;
  let shouldRefreshCookie = false;
  let shouldClearCookie = false;

  if (sessionCookie) {
    const parsed = decryptPayload<BffSessionData>(sessionCookie);
    if (parsed) {
      const refreshed = await refreshSessionIfNeeded(parsed);
      if (refreshed) {
        activeSession = refreshed.session;
        shouldRefreshCookie = refreshed.refreshed;
      } else {
        shouldClearCookie = true;
      }
    } else {
      shouldClearCookie = true;
    }
  }

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  const accept = request.headers.get('accept');

  if (contentType) headers.set('content-type', contentType);
  if (accept) headers.set('accept', accept);
  if (activeSession?.accessToken) {
    headers.set('authorization', `Bearer ${activeSession.accessToken}`);
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: 'no-store',
    });

    const isNullBodyStatus = upstream.status === 204 || upstream.status === 304;
    const responseBody = isNullBodyStatus ? null : await upstream.arrayBuffer();

    const response = new NextResponse(responseBody, {
      status: upstream.status,
    });

    const upstreamContentType = upstream.headers.get('content-type');
    if (upstreamContentType) {
      response.headers.set('content-type', upstreamContentType);
    }

    if (shouldRefreshCookie && activeSession) {
      setSessionCookie(response, activeSession, getPublicOrigin(request));
    } else if (shouldClearCookie) {
      response.cookies.delete(SESSION_COOKIE_NAME);
    }

    return response;
  } catch {
    return NextResponse.json(
      { message: 'Cannot connect to DevMeet API.' },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
