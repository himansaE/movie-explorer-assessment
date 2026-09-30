import React from 'react';
import { Alert, Button, Chip, CircularProgress, IconButton } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import { motion, useReducedMotion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { fetchCredits, fetchMovieDetails, fetchVideos, getErrorMessage, imageUrl } from './api';
import { useFavorites } from './favorites';

export function DetailsPage() {
  const { id: rawId } = useParams();
  const id = /^\d{1,10}$/.test(rawId || '') ? Number(rawId) : 0;
  const reducedMotion = useReducedMotion();
  const { isFavorite, toggleFavorite } = useFavorites();
  const details = useQuery({ queryKey: ['movie', id], queryFn: ({ signal }) => fetchMovieDetails(id, signal), enabled: id > 0, staleTime: 5 * 60 * 1000 });
  const credits = useQuery({ queryKey: ['movie', id, 'credits'], queryFn: ({ signal }) => fetchCredits(id, signal), enabled: id > 0, staleTime: 5 * 60 * 1000 });
  const videos = useQuery({ queryKey: ['movie', id, 'videos'], queryFn: ({ signal }) => fetchVideos(id, signal), enabled: id > 0, staleTime: 5 * 60 * 1000 });
  if (!id) return <main className="container detail-error"><h1>Invalid movie</h1><Button component={Link} to="/">Back to movies</Button></main>;
  if (details.isPending) return <main className="page-loader"><CircularProgress aria-label="Loading movie" /></main>;
  if (details.isError) return <main className="container detail-error"><Alert severity="error">{getErrorMessage(details.error)}</Alert><Button onClick={() => void details.refetch()}>Retry</Button><Button component={Link} to="/">Back to movies</Button></main>;
  const movie = details.data;
  const trailer = videos.data?.results.find((video) => video.site === 'YouTube' && video.type === 'Trailer' && /^[a-zA-Z0-9_-]{8,20}$/.test(video.key));
  return <motion.main className="detail-page" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .34 }}>
    <div className="detail-backdrop" style={{ backgroundImage: imageUrl(movie.backdrop_path, 'original') ? `url(${imageUrl(movie.backdrop_path, 'original')})` : undefined }} />
    <div className="container detail-content"><Button component={Link} to="/" className="back-link" startIcon={<ArrowBackRoundedIcon />}>Back to explore</Button>
      <div className="detail-lead"><div className="detail-poster">{imageUrl(movie.poster_path, 'w500') ? <img src={imageUrl(movie.poster_path, 'w500')} alt={`${movie.title} poster`} /> : <div className="poster-fallback"><MovieFilterRoundedIcon />Poster unavailable</div>}</div>
        <div className="detail-text"><span className="detail-kicker">Movie details</span><h1>{movie.title}</h1>{movie.tagline && <p className="tagline">{movie.tagline}</p>}<div className="detail-meta"><span>{movie.release_date?.slice(0, 4) || 'Year unknown'}</span><span><StarRoundedIcon />{movie.vote_average ? movie.vote_average.toFixed(1) : 'Unrated'}</span>{movie.runtime ? <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span> : null}</div><div className="genre-list">{movie.genres?.map((genre) => <Chip key={genre.id} label={genre.name} />)}</div><p className="detail-overview">{movie.overview || 'An overview is not available for this film.'}</p><div className="detail-actions"><Button variant="contained" startIcon={isFavorite(movie.id) ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />} onClick={() => toggleFavorite(movie)}>{isFavorite(movie.id) ? 'Saved to favorites' : 'Add to favorites'}</Button>{trailer && <Button variant="outlined" startIcon={<PlayArrowRoundedIcon />} href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noopener noreferrer">Watch trailer</Button>}</div></div>
      </div>
      <section className="cast-section"><div className="section-heading"><div><span className="section-accent" /><h2>Cast</h2><p>The people behind the story</p></div></div>{credits.isPending ? <div className="cast-loading"><CircularProgress size={28} /></div> : credits.data?.cast?.length ? <div className="cast-rail">{credits.data.cast.slice(0, 12).map((person) => <div className="cast-card" key={person.id}><div className="cast-photo">{imageUrl(person.profile_path, 'w342') ? <img src={imageUrl(person.profile_path, 'w342')} alt={person.name} loading="lazy" /> : <MovieFilterRoundedIcon />}</div><strong>{person.name}</strong><span>{person.character}</span></div>)}</div> : <p>Cast details are unavailable.</p>}</section>
    </div>
  </motion.main>;
}
