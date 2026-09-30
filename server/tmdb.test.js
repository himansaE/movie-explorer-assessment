import test from 'node:test';
import assert from 'node:assert/strict';
import * as tmdb from './tmdb.js';

test('TMDb route selection permits only known operations', () => {
  assert.equal(tmdb.buildTmdbPath({ kind: 'trending', page: '2' }), '/trending/movie/day?page=2&language=en-US');
  assert.equal(tmdb.buildTmdbPath({ kind: 'details', id: '42' }), '/movie/42?language=en-US');
  assert.equal(tmdb.buildTmdbPath({ kind: 'search', query: 'Dune & Beyond', page: '1' }), '/search/movie?query=Dune%20%26%20Beyond&page=1&include_adult=false&language=en-US');
  assert.throws(() => tmdb.buildTmdbPath({ kind: 'unknown' }));
  assert.throws(() => tmdb.buildTmdbPath({ kind: 'details', id: '../users' }));
  assert.throws(() => tmdb.buildTmdbPath({ kind: 'search', query: ' ' }));
  assert.throws(() => tmdb.buildTmdbPath({ kind: 'trending', page: '9999' }));
});
