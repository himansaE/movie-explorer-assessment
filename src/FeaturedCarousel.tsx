import React from 'react';
import { Button, IconButton } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import type { Movie } from './types';

interface FeaturedCarouselProps {
  movies: Movie[];
  activeIndex: number;
  onSelect: (index: number) => void;
  collectionLabel: string;
}

export function FeaturedCarousel({ movies, activeIndex, onSelect, collectionLabel }: FeaturedCarouselProps) {
  const reducedMotion = useReducedMotion();
  const movie = movies[activeIndex] || movies[0];
  if (!movie) {
    return <div className="featured-placeholder"><h2>A good film changes the evening.</h2><p>Choose a collection below or search for a movie you already have in mind.</p></div>;
  }
  const index = movies.indexOf(movie);
  const year = movie.release_date?.slice(0, 4);
  const score = movie.vote_average > 0 ? movie.vote_average.toFixed(1) : null;
  return <div className="featured-carousel" role="region" aria-label="Featured movies">
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={movie.id} className="featured-glass" initial={reducedMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(10px)' }} animate={reducedMotion ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' }} exit={reducedMotion ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-8px)', transition: { duration: .12 } }} transition={{ duration: reducedMotion ? .12 : .2, ease: [0.23, 1, 0.32, 1] }} aria-live="polite">
        <div className="featured-label"><span>{collectionLabel}</span><span>{index + 1} / {movies.length}</span></div>
        <h2>{movie.title}</h2>
        <div className="featured-meta">{year && <span>{year}</span>}{score && <span><StarRoundedIcon aria-hidden="true" /> {score} on TMDb</span>}</div>
        <p>{movie.overview || 'Explore the cast, details, and trailer for this film.'}</p>
        <Button component={Link} to={`/movie/${movie.id}`} variant="contained" endIcon={<ArrowForwardRoundedIcon />}>View movie details</Button>
      </motion.div>
    </AnimatePresence>
    {movies.length > 1 && <div className="featured-controls">
      <div className="featured-arrows"><IconButton aria-label="Previous featured movie" onClick={() => onSelect((index - 1 + movies.length) % movies.length)}><ArrowBackRoundedIcon /></IconButton><IconButton aria-label="Next featured movie" onClick={() => onSelect((index + 1) % movies.length)}><ArrowForwardRoundedIcon /></IconButton></div>
      <div className="featured-dots" aria-label="Choose featured movie">{movies.map((item, itemIndex) => <button key={item.id} type="button" className={itemIndex === index ? 'is-active' : ''} aria-label={`Show ${item.title}`} aria-current={itemIndex === index ? 'true' : undefined} onClick={() => onSelect(itemIndex)} />)}</div>
    </div>}
  </div>;
}
