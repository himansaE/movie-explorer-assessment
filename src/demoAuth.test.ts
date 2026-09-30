import { clearDemoSession, readDemoSession, saveDemoSession, validateDemoCredentials } from './demoAuth';

beforeEach(() => sessionStorage.clear());

test('demo credentials are checked locally against configured values', () => {
  const config = { username: 'demo', password: 'MovieExplorer2026!' };
  expect(validateDemoCredentials(' DEMO ', 'MovieExplorer2026!', config)).toBe(true);
  expect(validateDemoCredentials('demo', 'wrong', config)).toBe(false);
  expect(validateDemoCredentials('other', 'MovieExplorer2026!', config)).toBe(false);
});

test('demo session lasts through refresh in this browser tab', () => {
  const config = { username: 'demo', password: 'MovieExplorer2026!' };
  saveDemoSession('demo');
  expect(readDemoSession(config)).toBe('demo');
  clearDemoSession();
  expect(readDemoSession(config)).toBeNull();
});
