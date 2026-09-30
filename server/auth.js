import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

const COOKIE = 'movie_explorer_session';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const digest = (value) => createHash('sha256').update(String(value)).digest();
const safeEqual = (left, right) => timingSafeEqual(digest(left), digest(right));

export function configured(env = process.env) {
  return Boolean(env.DEMO_USERNAME && env.DEMO_PASSWORD && env.DEMO_PASSWORD.length >= 12 && env.AUTH_COOKIE_SECRET && env.AUTH_COOKIE_SECRET.length >= 32 && !env.DEMO_PASSWORD.startsWith('replace-') && !env.AUTH_COOKIE_SECRET.startsWith('replace-'));
}

export function credentialsValid(username, password, env = process.env) {
  if (!configured(env) || typeof username !== 'string' || typeof password !== 'string') return false;
  return safeEqual(username.trim().toLowerCase(), env.DEMO_USERNAME.trim().toLowerCase()) && safeEqual(password, env.DEMO_PASSWORD);
}

export function createSession(username, secret, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ sub: username, exp: now + SESSION_MS })).toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySession(token, secret, now = Date.now()) {
  if (typeof token !== 'string' || !secret || token.length > 2048) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const expected = createHmac('sha256', secret).update(parts[0]).digest('base64url');
  if (!safeEqual(parts[1], expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    return typeof payload.sub === 'string' && payload.sub.length > 0 && Number.isFinite(payload.exp) && payload.exp > now ? payload.sub : null;
  } catch { return null; }
}

export function sessionFromRequest(req, env = process.env) {
  if (!configured(env)) return null;
  const raw = String(req.headers.cookie || '').split(';').map((item) => item.trim()).find((item) => item.startsWith(`${COOKIE}=`));
  return verifySession(raw?.slice(COOKIE.length + 1), env.AUTH_COOKIE_SECRET);
}

function sessionCookie(value, req, maxAge) {
  const secure = req.headers['x-forwarded-proto'] === 'https' || req.socket?.encrypted;
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

export async function authHandler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    const username = sessionFromRequest(req);
    return res.status(username ? 200 : 401).json({ authenticated: Boolean(username), username });
  }
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', sessionCookie('', req, 0));
    return res.status(200).json({ authenticated: false });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!configured()) return res.status(503).json({ error: 'Demo login is not configured on the server.' });
  if (!credentialsValid(req.body?.username, req.body?.password)) return res.status(401).json({ error: 'Incorrect username or password.' });
  const username = process.env.DEMO_USERNAME.trim().toLowerCase();
  res.setHeader('Set-Cookie', sessionCookie(createSession(username, process.env.AUTH_COOKIE_SECRET), req, Math.floor(SESSION_MS / 1000)));
  return res.status(200).json({ authenticated: true, username });
}
