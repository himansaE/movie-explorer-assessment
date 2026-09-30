import test from 'node:test';
import assert from 'node:assert/strict';
import { authHandler, createSession } from './auth.js';
import { tmdbHandler } from './tmdb.js';

function response() {
  return { code: 200, headers: {}, body: null, status(code) { this.code = code; return this; }, setHeader(key, value) { this.headers[key] = value; }, json(body) { this.body = body; return this; } };
}
const env = { DEMO_USERNAME: 'demo', DEMO_PASSWORD: 'MovieExplorer2026!', AUTH_COOKIE_SECRET: 'x'.repeat(40), TMDB_API_TOKEN: 'test-token' };

test('auth handler signs in, restores and clears session using HttpOnly cookie', async () => {
  Object.assign(process.env, env);
  const login = response();
  await authHandler({ method: 'POST', body: { username: 'demo', password: env.DEMO_PASSWORD }, headers: {}, socket: {} }, login);
  assert.equal(login.code, 200);
  assert.match(login.headers['Set-Cookie'], /HttpOnly; SameSite=Lax/);
  const cookie = login.headers['Set-Cookie'].split(';')[0];
  const restored = response();
  await authHandler({ method: 'GET', headers: { cookie } }, restored);
  assert.equal(restored.body.username, 'demo');
  const logout = response();
  await authHandler({ method: 'DELETE', headers: { cookie }, socket: {} }, logout);
  assert.match(logout.headers['Set-Cookie'], /Max-Age=0/);
});

test('proxy requires authentication and sends only server token to TMDb', async () => {
  Object.assign(process.env, env);
  const guest = response();
  await tmdbHandler({ method: 'GET', headers: {}, query: { kind: 'trending' } }, guest);
  assert.equal(guest.code, 401);
  const originalFetch = globalThis.fetch;
  let upstreamUrl = '';
  let upstreamAuth = '';
  globalThis.fetch = async (url, options) => {
    upstreamUrl = url; upstreamAuth = options.headers.Authorization;
    return { ok: true, json: async () => ({ page: 1, results: [] }) };
  };
  try {
    const cookie = `movie_explorer_session=${createSession('demo', env.AUTH_COOKIE_SECRET)}`;
    const result = response();
    await tmdbHandler({ method: 'GET', headers: { cookie }, query: { kind: 'trending', page: '1' } }, result);
    assert.equal(result.code, 200);
    assert.match(upstreamUrl, /\/trending\/movie\/day\?page=1/);
    assert.equal(upstreamAuth, 'Bearer test-token');
    assert.deepEqual(result.body, { page: 1, results: [] });
  } finally { globalThis.fetch = originalFetch; }
});
