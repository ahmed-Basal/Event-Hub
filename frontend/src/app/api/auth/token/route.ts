import { NextRequest, NextResponse } from 'next/server';
import {
  type BffSessionData,
  decryptPayload,
  getPublicOrigin,
  refreshSessionIfNeeded,
  SESSION_COOKIE_NAME,
  setSessionCookie,
} from '@/core/auth/bffSession';

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) {
    return NextResponse.json({ accessToken: null }, { status: 401 });
  }

  const parsed = decryptPayload<BffSessionData>(cookie);
  if (!parsed) {
    const res = NextResponse.json({ accessToken: null }, { status: 401 });
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  const refreshed = await refreshSessionIfNeeded(parsed);
  if (!refreshed) {
    const res = NextResponse.json({ accessToken: null }, { status: 401 });
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  const response = NextResponse.json({ accessToken: refreshed.session.accessToken }, { status: 200 });
  if (refreshed.refreshed) {
    setSessionCookie(response, refreshed.session, getPublicOrigin(request));
  }

  return response;
}
