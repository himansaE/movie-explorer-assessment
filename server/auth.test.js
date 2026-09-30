import test from 'node:test';
import assert from 'node:assert/strict';
import * as auth from './auth.js';

test('demo credentials are checked without exposing the password', () => {
  const env = { DEMO_USERNAME: 'demo', DEMO_PASSWORD: 'A long password', AUTH_COOKIE_SECRET: 'a'.repeat(32) };
  assert.equal(auth.credentialsValid(' DEMO ', 'A long password', env), true);
  assert.equal(auth.credentialsValid('demo', 'wrong', env), false);
  assert.equal(auth.credentialsValid('other', 'A long password', env), false);
});

test('signed session rejects tampering and expiry', () => {
  const secret = 'b'.repeat(32);
  const token = auth.createSession('demo', secret, 1000);
  assert.equal(auth.verifySession(token, secret, 1001), 'demo');
  assert.equal(auth.verifySession(token + 'x', secret, 1001), null);
  assert.equal(auth.verifySession(token, secret, 1000 + 8 * 24 * 60 * 60 * 1000), null);
});
