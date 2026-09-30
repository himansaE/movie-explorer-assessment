import axios from 'axios';
import type { Credits, MovieDetails, MoviePage, Videos } from './types';

export type BrowseCategory = 'now_playing' | 'trending' | 'upcoming' | 'top_rated';

const browsePaths: Record<BrowseCategory, string> = {
  now_playing: '/movie/now_playing',
  trending: '/trending/movie/week',
  upcoming: '/discover/movie',
  top_rated: '/movie/top_rated',
};

const token = process.env.REACT_APP_TMDB_API_TOKEN?.trim();
const http = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  timeout: 10000,
  headers: token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : undefined,
});

function requireToken(): void {
  if (!token || token.startsWith('replace-')) {
    throw new Error('Add a disposable TMDb token to REACT_APP_TMDB_API_TOKEN in .env, then restart the app.');
  }
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Connection failed. Check your network and retry.';
    if (error.response.status === 401) return 'TMDb rejected the demo token. Check REACT_APP_TMDB_API_TOKEN.';
    if (error.response.status === 429) return 'TMDb rate limit reached. Please try again later.';
    return 'The movie service is unavailable. Please retry.';
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please retry.';
}

export async function fetchMoviePage(kind: BrowseCategory | 'search', page: number, query: string, signal?: AbortSignal): Promise<MoviePage> {
  requireToken();
  const path = kind === 'search' ? '/search/movie' : browsePaths[kind];
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const params = kind === 'search'
    ? { query, page, include_adult: false, language: 'en-US' }
    : kind === 'upcoming'
      ? { page, language: 'en-US', include_adult: false, include_video: false, sort_by: 'popularity.desc', 'primary_release_date.gte': localDate }
      : { page, language: 'en-US' };
  const { data } = await http.get<MoviePage>(path, { params, signal });
  return data;
}
export async function fetchMovieDetails(id: number, signal?: AbortSignal): Promise<MovieDetails> {
  requireToken();
  const { data } = await http.get<MovieDetails>(`/movie/${id}`, { params: { language: 'en-US' }, signal });
  return data;
}
export async function fetchCredits(id: number, signal?: AbortSignal): Promise<Credits> {
  requireToken();
  const { data } = await http.get<Credits>(`/movie/${id}/credits`, { params: { language: 'en-US' }, signal });
  return data;
}
export async function fetchVideos(id: number, signal?: AbortSignal): Promise<Videos> {
  requireToken();
  const { data } = await http.get<Videos>(`/movie/${id}/videos`, { params: { language: 'en-US' }, signal });
  return data;
}
export function imageUrl(path: string | null | undefined, size: 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | undefined {
  if (!path || !/^\/[a-zA-Z0-9._/-]+$/.test(path)) return undefined;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
