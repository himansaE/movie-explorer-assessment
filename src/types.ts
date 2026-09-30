export interface Movie {
  id: number;
  title: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average: number;
  genre_ids?: number[];
}
export interface MoviePage { page: number; total_pages: number; total_results: number; results: Movie[] }
export interface MovieDetails extends Movie {
  runtime: number | null;
  tagline?: string;
  genres: { id: number; name: string }[];
  status?: string;
}
export interface Credits { cast: { id: number; name: string; character: string; profile_path: string | null }[] }
export interface Videos { results: { id: string; key: string; site: string; type: string; official: boolean }[] }
export type FavoriteMovie = Pick<Movie, 'id' | 'title' | 'poster_path' | 'release_date' | 'vote_average'>;
