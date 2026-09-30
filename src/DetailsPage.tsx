import React, { useState } from 'react';
import { Alert, Button, Chip, Skeleton } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import { motion, useReducedMotion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { fetchCredits, fetchMovieDetails, fetchVideos, getErrorMessage, imageUrl } from './api';
import { useFavoriteAction } from './useFavoriteAction';
import { exploreReturn } from './navigation';
import type { Movie } from './types';

type MovieRouteState = { from?: string; preview?: Movie };
const easeOut = [0.23, 1, 0.32, 1] as const;

function DetailTextSkeleton({ title }: { title?: string }) {
  return <div className="detail-text" aria-label="Loading movie details">
    <span className="detail-kicker">Movie details</span>
    {title ? <h1>{title}</h1> : <Skeleton variant="text" className="detail-title-skeleton" />}
    <Skeleton variant="text" width="58%" height={34} />
    <div className="detail-meta"><Skeleton width={56} height={28} /><Skeleton width={65} height={28} /><Skeleton width={75} height={28} /></div>
    <div className="genre-list"><Skeleton variant="rounded" width={90} height={32} /><Skeleton variant="rounded" width={76} height={32} /></div>
    <div className="detail-overview-skeleton"><Skeleton variant="text" /><Skeleton variant="text" /><Skeleton variant="text" width="72%" /></div>
    <div className="detail-actions"><Skeleton variant="rounded" width={170} height={44} /><Skeleton variant="rounded" width={140} height={44} /></div>
  </div>;
}

function CastSkeleton() {
  return <div className="cast-rail" aria-label="Loading cast">{Array.from({ length: 6 }, (_, index) => <div className="cast-card" key={index}><Skeleton variant="rounded" className="cast-photo-skeleton" /><Skeleton variant="text" width="88%" height={24} /><Skeleton variant="text" width="68%" height={18} /></div>)}</div>;
}

export function DetailsPage() {
  const { id: rawId } = useParams();
  const id = /^\d{1,10}$/.test(rawId || '') ? Number(rawId) : 0;
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as MovieRouteState | null;
  const preview = routeState?.preview?.id === id ? routeState.preview : undefined;
  const reducedMotion = useReducedMotion();
  const [loadedPoster, setLoadedPoster] = useState<string | null>(null);
  const [failedPoster, setFailedPoster] = useState<string | null>(null);
  const { signedIn, isFavorite, toggleOrSignIn } = useFavoriteAction();
  const details = useQuery({ queryKey: ['movie', id], queryFn: ({ signal }) => fetchMovieDetails(id, signal), enabled: id > 0, staleTime: 5 * 60 * 1000 });
  const credits = useQuery({ queryKey: ['movie', id, 'credits'], queryFn: ({ signal }) => fetchCredits(id, signal), enabled: id > 0, staleTime: 5 * 60 * 1000 });
  const videos = useQuery({ queryKey: ['movie', id, 'videos'], queryFn: ({ signal }) => fetchVideos(id, signal), enabled: id > 0, staleTime: 5 * 60 * 1000 });
  const returnDestination = exploreReturn(routeState?.from);
  const returnState = returnDestination.clearedSearch ? { skipSavedSearch: true } : undefined;
  if (!id) return <main className="container detail-error"><h1>Invalid movie</h1><Button component={Link} to="/">Back to movies</Button></main>;
  if (details.isError) return <main className="container detail-error"><Alert severity="error">{getErrorMessage(details.error)}</Alert><Button onClick={() => void details.refetch()}>Retry</Button><Button component={Link} to={returnDestination.path} state={returnState}>Back to movies</Button></main>;
  const movie = details.data;
  const display = movie || preview;
  const backdrop = imageUrl(display?.backdrop_path, 'original');
  const poster = imageUrl(display?.poster_path, 'w500');
  const trailer = videos.data?.results.find((video) => video.site === 'YouTube' && video.type === 'Trailer' && /^[a-zA-Z0-9_-]{8,20}$/.test(video.key));
  const animated = !reducedMotion;
  const backTo = returnDestination.path;
  function backToExplore(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!returnDestination.clearedSearch && routeState?.from && window.history.length > 1 && !event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) {
      event.preventDefault();
      navigate(-1);
    }
  }
  return <main className="detail-page" aria-busy={details.isPending}>
    <motion.div className="detail-backdrop" style={{ backgroundImage: backdrop ? `url(${backdrop})` : undefined }} initial={animated ? { opacity: 0, transform: 'translateY(-14px)' } : { opacity: 0 }} animate={{ opacity: 0.5, transform: 'translateY(0px)' }} transition={{ duration: .24, ease: easeOut }} aria-hidden="true" />
    <div className="container detail-content"><Button component={Link} to={backTo} state={returnState} onClick={backToExplore} className="back-link" startIcon={<ArrowBackRoundedIcon />}>Back to explore</Button>
      <div className="detail-lead"><motion.div className="detail-poster" initial={animated ? { opacity: 0, transform: 'translateY(18px) scale(.97)' } : { opacity: 0 }} animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }} transition={{ duration: .24, ease: easeOut, delay: .02 }}>{poster && failedPoster !== poster ? <>{loadedPoster !== poster && <Skeleton variant="rounded" className="detail-poster-skeleton" />}<img className={loadedPoster === poster ? 'is-loaded' : ''} src={poster} alt={`${display?.title} poster`} onLoad={() => setLoadedPoster(poster)} onError={() => setFailedPoster(poster)} /></> : details.isPending && !poster ? <Skeleton variant="rounded" className="detail-poster-skeleton" /> : <div className="poster-fallback"><MovieFilterRoundedIcon />Poster unavailable</div>}</motion.div>
        <motion.div className="detail-text-layer" initial={animated ? { opacity: 0, transform: 'translateY(20px)' } : { opacity: 0 }} animate={{ opacity: 1, transform: 'translateY(0px)' }} transition={{ duration: .22, ease: easeOut, delay: .06 }}>
          {details.isPending ? <DetailTextSkeleton title={display?.title} /> : movie && <div className="detail-text"><span className="detail-kicker">Movie details</span><h1>{movie.title}</h1>{movie.tagline && <p className="tagline">{movie.tagline}</p>}<div className="detail-meta"><span>{movie.release_date?.slice(0, 4) || 'Year unknown'}</span><span><StarRoundedIcon />{movie.vote_average ? movie.vote_average.toFixed(1) : 'Unrated'}</span>{movie.runtime ? <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span> : null}</div><div className="genre-list">{movie.genres?.map((genre) => <Chip key={genre.id} label={genre.name} />)}</div><p className="detail-overview">{movie.overview || 'An overview is not available for this film.'}</p><div className="detail-actions"><Button variant="contained" startIcon={isFavorite(movie.id) ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />} onClick={() => toggleOrSignIn(movie)}>{!signedIn ? 'Sign in to save' : isFavorite(movie.id) ? 'Saved to favorites' : 'Add to favorites'}</Button>{videos.isPending ? <Skeleton variant="rounded" width={146} height={44} /> : trailer && <Button variant="outlined" startIcon={<PlayArrowRoundedIcon />} href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noopener noreferrer">Watch trailer</Button>}</div></div>}
        </motion.div>
      </div>
      <motion.section className="cast-section" initial={animated ? { opacity: 0, transform: 'translateY(16px)' } : { opacity: 0 }} animate={{ opacity: 1, transform: 'translateY(0px)' }} transition={{ duration: .2, ease: easeOut, delay: .1 }}><div className="section-heading"><div><span className="section-accent" /><h2>Cast</h2><p>The people behind the story</p></div></div>{details.isPending || credits.isPending ? <CastSkeleton /> : credits.data?.cast?.length ? <div className="cast-rail">{credits.data.cast.slice(0, 12).map((person) => <div className="cast-card" key={person.id}><div className="cast-photo">{imageUrl(person.profile_path, 'w342') ? <img src={imageUrl(person.profile_path, 'w342')} alt={person.name} loading="lazy" /> : <MovieFilterRoundedIcon />}</div><strong>{person.name}</strong><span>{person.character}</span></div>)}</div> : <p>Cast details are unavailable.</p>}</motion.section>
    </div>
  </main>;
}
