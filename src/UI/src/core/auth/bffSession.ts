import crypto from 'node:crypto';

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
    roles: string[];
  };
}

export interface PkceCookieData {
  codeVerifier: string;
  state: string;
  returnTo: string;
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
