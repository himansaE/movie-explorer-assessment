import axios from 'axios';
import type { Credits, MovieDetails, MoviePage, Videos } from './types';

export const http = axios.create({ baseURL: '/api', withCredentials: true, timeout: 10000 });

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Connection failed. Check your network and retry.';
    return typeof error.response.data?.error === 'string' ? error.response.data.error : 'Request failed. Please retry.';
  }
  return 'Something went wrong. Please retry.';
}
export async function fetchMoviePage(kind: 'trending' | 'search', page: number, query: string, signal?: AbortSignal): Promise<MoviePage> {
  const { data } = await http.get<MoviePage>('/tmdb', { params: { kind, page, ...(kind === 'search' ? { query } : {}) }, signal });
  return data;
}
export async function fetchMovieDetails(id: number, signal?: AbortSignal): Promise<MovieDetails> {
  const { data } = await http.get<MovieDetails>('/tmdb', { params: { kind: 'details', id }, signal });
  return data;
}
export async function fetchCredits(id: number, signal?: AbortSignal): Promise<Credits> {
  const { data } = await http.get<Credits>('/tmdb', { params: { kind: 'credits', id }, signal });
  return data;
}
export async function fetchVideos(id: number, signal?: AbortSignal): Promise<Videos> {
  const { data } = await http.get<Videos>('/tmdb', { params: { kind: 'videos', id }, signal });
  return data;
}
export function imageUrl(path: string | null | undefined, size: 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | undefined {
  if (!path || !/^\/[a-zA-Z0-9._/-]+$/.test(path)) return undefined;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
