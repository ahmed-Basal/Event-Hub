import crypto from 'node:crypto';
import type { NextResponse } from 'next/server';
import type { ApiResponse } from '@/core/api/types';
import type { User } from '@modules/identity/types';

export const SESSION_COOKIE_NAME = 'devmeet_session';
export const PKCE_COOKIE_NAME = 'devmeet_pkce';

export interface BffSessionData {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number;
  user: {
    id: string;
    username: string;
    email: string;
    displayName: string;
    image?: string | null;
    roles: string[];
  };
}

export interface PkceCookieData {
  codeVerifier: string;
  state: string;
  returnTo: string;
}

export interface KeycloakTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
}

function getEncryptionKey(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET environment variable must be set in production.');
  }
  const raw = secret || 'devmeet-local-dev-session-secret-change-me';
  return crypto.createHash('sha256').update(raw).digest();
}

export function encryptPayload<T>(data: T): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const json = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

export function decryptPayload<T>(token: string): T | null {
  try {
    const buf = Buffer.from(token, 'base64url');
    if (buf.length < 28) return null;
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8')) as T;
  } catch {
    return null;
  }
}

export function generatePkcePair() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  const state = crypto.randomBytes(16).toString('base64url');
  return { codeVerifier, codeChallenge, state };
}

export function getKeycloakConfig() {
  const publicIssuer = process.env.KEYCLOAK_ISSUER || 'http://localhost:8082/realms/reactivities';
  const internalIssuer = process.env.KEYCLOAK_INTERNAL_ISSUER || publicIssuer;
  const clientId = process.env.KEYCLOAK_CLIENT_ID || 'reactivities-web';
  return { publicIssuer, internalIssuer, clientId };
}

export function getPublicOrigin(request: {
  headers: Headers;
  nextUrl: { origin: string; protocol: string };
}): string {
  const configured = process.env.APP_PUBLIC_URL?.replace(/\/$/, '');
  if (configured) return configured;

  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const host = forwardedHost || request.headers.get('host')?.trim();
  const proto =
    request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
    request.nextUrl.protocol.replace(':', '') ||
    'http';

  if (host && !host.startsWith('0.0.0.0')) {
    return `${proto}://${host}`;
  }
  return request.nextUrl.origin;
}

export function getInternalApiUrl(): string {
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://localhost:7223/api'
  ).replace(/\/$/, '');
}

export function getKeycloakAdminConfig() {
  const { internalIssuer } = getKeycloakConfig();
  const [rawBase, rawRealm] = internalIssuer.replace(/\/$/, '').split('/realms/');
  const baseUrl = rawBase || 'http://localhost:8082';
  const realm = rawRealm?.split('/')[0] || 'reactivities';
  const adminUser = process.env.KEYCLOAK_ADMIN || 'admin';
  const adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';
  return { baseUrl, realm, adminUser, adminPassword };
}

export function decodeJwtPayload(jwt: string): Record<string, unknown> {
  try {
    const parts = jwt.split('.');
    if (parts.length < 2) return {};
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function buildSessionFromTokens(tokens: KeycloakTokenResponse): BffSessionData {
  const claims = decodeJwtPayload(tokens.access_token);
  const realmAccess = claims.realm_access as { roles?: unknown } | undefined;
  const rawRoles = Array.isArray(claims.roles)
    ? claims.roles
    : Array.isArray(realmAccess?.roles)
      ? realmAccess.roles
      : [];

  const roles = rawRoles.map((r) => String(r)).filter(Boolean);
  const username = String(claims.preferred_username ?? claims.email ?? '');
  const displayName = String(claims.name ?? (username || 'User'));

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    idToken: tokens.id_token,
    expiresAt: Date.now() + (tokens.expires_in ?? 300) * 1000,
    user: {
      id: String(claims.sub ?? ''),
      username,
      email: String(claims.email ?? ''),
      displayName,
      roles,
    },
  };
}

export function mergeSyncedUserIntoSession(
  session: BffSessionData,
  synced: User | null
): BffSessionData {
  if (!synced) return session;
  return {
    ...session,
    user: {
      ...session.user,
      id: synced.id || session.user.id,
      username: synced.username || session.user.username,
      displayName: synced.displayName || session.user.displayName,
      image: synced.image ?? session.user.image,
      roles: synced.roles && synced.roles.length > 0 ? synced.roles : session.user.roles,
    },
  };
}

export function setSessionCookie(
  response: NextResponse,
  session: BffSessionData,
  origin: string
): void {
  response.cookies.set(SESSION_COOKIE_NAME, encryptPayload(session), {
    httpOnly: true,
    secure: origin.startsWith('https://'),
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function refreshSessionIfNeeded(
  session: BffSessionData
): Promise<{ session: BffSessionData; refreshed: boolean } | null> {
  if (session.expiresAt - Date.now() > 30_000) {
    return { session, refreshed: false };
  }

  if (!session.refreshToken) {
    return null;
  }

  const { internalIssuer, clientId } = getKeycloakConfig();
  try {
    const res = await fetch(`${internalIssuer}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        refresh_token: session.refreshToken,
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const tokens = (await res.json()) as KeycloakTokenResponse;
    const next = buildSessionFromTokens({
      ...tokens,
      refresh_token: tokens.refresh_token ?? session.refreshToken,
      id_token: tokens.id_token ?? session.idToken,
    });
    next.user.image = session.user.image;
    return { session: next, refreshed: true };
  } catch {
    return null;
  }
}

export async function getKeycloakAdminToken(): Promise<string | null> {
  const { baseUrl, adminUser, adminPassword } = getKeycloakAdminConfig();
  try {
    const res = await fetch(`${baseUrl}/realms/master/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: 'admin-cli',
        grant_type: 'password',
        username: adminUser,
        password: adminPassword,
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

export async function ensureDirectAccessGrantsEnabled(adminToken: string): Promise<boolean> {
  const { baseUrl, realm } = getKeycloakAdminConfig();
  const { clientId } = getKeycloakConfig();

  try {
    const listRes = await fetch(
      `${baseUrl}/admin/realms/${encodeURIComponent(realm)}/clients?clientId=${encodeURIComponent(clientId)}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        cache: 'no-store',
      }
    );

    if (!listRes.ok) return false;
    const clients = (await listRes.json()) as Array<{
      id: string;
      directAccessGrantsEnabled?: boolean;
      [key: string]: unknown;
    }>;

    const client = clients[0];
    if (!client?.id) return false;
    if (client.directAccessGrantsEnabled) return true;

    const updateRes = await fetch(
      `${baseUrl}/admin/realms/${encodeURIComponent(realm)}/clients/${encodeURIComponent(client.id)}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...client, directAccessGrantsEnabled: true }),
        cache: 'no-store',
      }
    );

    return updateRes.ok;
  } catch {
    return false;
  }
}

export async function syncUserWithBackend(accessToken: string): Promise<User | null> {
  try {
    const res = await fetch(`${getInternalApiUrl()}/account`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const body = (await res.json()) as ApiResponse<User>;
    return body?.data ?? null;
  } catch {
    return null;
  }
}

export async function createSessionWithBackendSync(
  tokens: KeycloakTokenResponse
): Promise<BffSessionData> {
  const session = buildSessionFromTokens(tokens);
  const synced = await syncUserWithBackend(tokens.access_token);
  return mergeSyncedUserIntoSession(session, synced);
}

export type PasswordGrantResult =
  | { ok: true; tokens: KeycloakTokenResponse }
  | { ok: false; status: number; error?: string; errorDescription?: string };

export async function exchangePasswordGrant(
  username: string,
  password: string
): Promise<PasswordGrantResult> {
  const { internalIssuer, clientId } = getKeycloakConfig();
  const tokenEndpoint = `${internalIssuer}/protocol/openid-connect/token`;

  const requestToken = async () =>
    fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: clientId,
        username: username.trim(),
        password,
        scope: 'openid profile email',
      }),
      cache: 'no-store',
    });

  try {
    let res = await requestToken();
    if (!res.ok) {
      const errBody = (await res.json().catch(() => ({}))) as {
        error?: string;
        error_description?: string;
      };

      if (res.status === 400 && errBody.error === 'unauthorized_client') {
        const adminToken = await getKeycloakAdminToken();
        if (adminToken && (await ensureDirectAccessGrantsEnabled(adminToken))) {
          res = await requestToken();
          if (res.ok) {
            const tokens = (await res.json()) as KeycloakTokenResponse;
            return { ok: true, tokens };
          }
          const retryErr = (await res.json().catch(() => ({}))) as {
            error?: string;
            error_description?: string;
          };
          return {
            ok: false,
            status: res.status,
            error: retryErr.error,
            errorDescription: retryErr.error_description,
          };
        }
      }

      return {
        ok: false,
        status: res.status,
        error: errBody.error,
        errorDescription: errBody.error_description,
      };
    }

    const tokens = (await res.json()) as KeycloakTokenResponse;
    return { ok: true, tokens };
  } catch {
    return {
      ok: false,
      status: 503,
      error: 'service_unavailable',
      errorDescription: 'Cannot connect to authentication service.',
    };
  }
}
