import type { FavoriteMovie } from './types';

const SEARCH_KEY = 'movieExplorer.lastSearch';
const FAVORITES_KEY = 'movieExplorer.favorites';

export function readLastSearch(): string {
  try { return localStorage.getItem(SEARCH_KEY)?.slice(0, 100) || ''; }
  catch { return ''; }
}
export function writeLastSearch(value: string): void {
  try { const term = value.trim().slice(0, 100); if (term) localStorage.setItem(SEARCH_KEY, term); }
  catch { /* Storage can be unavailable in private browsing. */ }
}
export function readFavorites(): FavoriteMovie[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<number>();
    return parsed.filter((item): item is FavoriteMovie => {
      if (!item || typeof item !== 'object') return false;
      const movie = item as Partial<FavoriteMovie>;
      if (!Number.isSafeInteger(movie.id) || Number(movie.id) <= 0 || typeof movie.title !== 'string' || movie.title.length > 200 || !(typeof movie.poster_path === 'string' || movie.poster_path === null) || typeof movie.vote_average !== 'number' || !Number.isFinite(movie.vote_average) || seen.has(movie.id as number)) return false;
      seen.add(movie.id as number);
      return true;
    }).slice(0, 500);
  } catch { return []; }
}
export function writeFavorites(movies: FavoriteMovie[]): void {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(movies.slice(0, 500))); }
  catch { /* Storage can be unavailable or full. */ }
}
