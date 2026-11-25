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
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  const parsed = decryptPayload<BffSessionData>(cookie);
  if (!parsed) {
    const res = NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  const refreshed = await refreshSessionIfNeeded(parsed);
  if (!refreshed) {
    const res = NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  const response = NextResponse.json({
    authenticated: true,
    user: refreshed.session.user,
  });

  if (refreshed.refreshed) {
    setSessionCookie(response, refreshed.session, getPublicOrigin(request));
  }

  return response;
}
