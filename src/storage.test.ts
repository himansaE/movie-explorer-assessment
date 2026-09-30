import { readFavorites, readLastSearch, writeFavorites, writeLastSearch } from './storage';

beforeEach(() => localStorage.clear());

test('last search survives reload and trims whitespace', () => {
  writeLastSearch('  Dune  ');
  expect(readLastSearch()).toBe('Dune');
  writeLastSearch('');
  expect(readLastSearch()).toBe('');
});

test('favorites survive reload and discard malformed entries', () => {
  writeFavorites([{ id: 42, title: 'A film', poster_path: null, release_date: '2025-01-01', vote_average: 7 }]);
  expect(readFavorites().map((movie) => movie.id)).toEqual([42]);
  localStorage.setItem('movieExplorer.favorites', '[{"id":"oops"}]');
  expect(readFavorites()).toEqual([]);
});

test('corrupted storage never blocks the app', () => {
  localStorage.setItem('movieExplorer.favorites', '{broken');
  expect(readFavorites()).toEqual([]);
});
