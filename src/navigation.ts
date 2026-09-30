import type { Movie } from './types';

export interface LoginRequestState {
  from?: string;
  returnState?: unknown;
  pendingFavorite?: Movie;
}

export function safeAppPath(path: string | undefined): string {
  if (!path?.startsWith('/') || path.startsWith('//')) return '/';
  try { return new URL(path, window.location.origin).origin === window.location.origin ? path : '/'; } catch { return '/'; }
}

export function exploreReturn(from: string | undefined): { path: string; clearedSearch: boolean } {
  const path = safeAppPath(from);
  const url = new URL(path, window.location.origin);
  if (url.pathname !== '/') return { path: '/', clearedSearch: false };
  const clearedSearch = url.searchParams.has('q');
  url.searchParams.delete('q');
  return { path: `${url.pathname}${url.search}`, clearedSearch };
}
