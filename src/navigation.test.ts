import { exploreReturn, safeAppPath } from './navigation';

test('movie back destination clears stale search but keeps the selected collection', () => {
  expect(exploreReturn('/?q=old%20film&view=trending')).toEqual({ path: '/?view=trending', clearedSearch: true });
  expect(exploreReturn('/?view=upcoming')).toEqual({ path: '/?view=upcoming', clearedSearch: false });
});

test('return paths cannot leave the app', () => {
  expect(safeAppPath('https://example.com')).toBe('/');
  expect(safeAppPath('//example.com')).toBe('/');
  expect(safeAppPath('/\\example.com')).toBe('/');
});
