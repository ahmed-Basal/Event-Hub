import { NextRequest, NextResponse } from 'next/server';
import {
  type BffSessionData,
  decryptPayload,
  SESSION_COOKIE_NAME,
} from '@/core/auth/bffSession';

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookie) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  const session = decryptPayload<BffSessionData>(cookie);
  if (!session || session.expiresAt <= Date.now()) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    user: session.user,
  });
}
