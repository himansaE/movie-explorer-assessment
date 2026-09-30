import React from 'react';
import { IconButton, Skeleton, Tooltip } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { fetchMovieDetails, imageUrl } from './api';
import type { BrowseCategory } from './api';
import { useFavorites } from './favorites';
import type { Movie } from './types';

function releaseLabel(movie: Movie, context?: BrowseCategory): string {
  if (context === 'upcoming' && movie.release_date) {
    const date = new Date(`${movie.release_date}T00:00:00Z`);
    if (!Number.isNaN(date.getTime())) {
      return `Releases ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date)}`;
    }
  }
  return movie.release_date?.slice(0, 4) || 'Release date unavailable';
}

export function MovieCard({ movie, context }: { movie: Movie; context?: BrowseCategory }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const queryClient = useQueryClient();
  const reducedMotion = useReducedMotion();
  const saved = isFavorite(movie.id);
  const prefetch = () => { void queryClient.prefetchQuery({ queryKey: ['movie', movie.id], queryFn: ({ signal }) => fetchMovieDetails(movie.id, signal), staleTime: 5 * 60 * 1000 }); };
  return <motion.article layout={!reducedMotion} className="movie-card" whileHover={reducedMotion ? undefined : { y: -5 }} transition={{ duration: 0.22 }} onMouseEnter={prefetch} onFocus={prefetch}>
    <Link className="movie-card-link" to={`/movie/${movie.id}`} aria-label={`View ${movie.title} details`}>
      <div className="poster-wrap">
        {imageUrl(movie.poster_path, 'w342') ? <img src={imageUrl(movie.poster_path, 'w342')} alt={`${movie.title} poster`} loading="lazy" /> : <div className="poster-fallback"><MovieFilterRoundedIcon fontSize="large" /><span>Poster unavailable</span></div>}
        <span className="poster-shade" />
        <span className="movie-rating"><StarRoundedIcon sx={{ fontSize: 16 }} />{movie.vote_average > 0 ? movie.vote_average.toFixed(1) : '—'}</span>
      </div>
      <h3>{movie.title}</h3>
      <p>{releaseLabel(movie, context)}</p>
    </Link>
    <Tooltip title={saved ? 'Remove from favorites' : 'Add to favorites'}>
      <IconButton className={`favorite-button ${saved ? 'is-saved' : ''}`} size="small" onClick={() => toggleFavorite(movie)} aria-label={`${saved ? 'Remove' : 'Add'} ${movie.title} ${saved ? 'from' : 'to'} favorites`}>
        {saved ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
      </IconButton>
    </Tooltip>
  </motion.article>;
}
export function MovieGrid({ movies, context }: { movies: Movie[]; context?: BrowseCategory }) {
  return <div className="movie-grid">{movies.map((movie) => <MovieCard key={movie.id} movie={movie} context={context} />)}</div>;
}
export function MovieSkeletons({ count = 10 }: { count?: number }) {
  return <div className="movie-grid" aria-label="Loading movies">{Array.from({ length: count }, (_, index) => <div className="movie-skeleton" key={index}><Skeleton variant="rounded" className="poster-skeleton" /><Skeleton width="76%" height={28} /><Skeleton width="38%" height={20} /></div>)}</div>;
}
