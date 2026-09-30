import React, { useEffect, useMemo, useRef } from 'react';
import { Alert, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { parseAsString, useQueryState } from 'nuqs';
import { fetchMoviePage, getErrorMessage, imageUrl } from './api';
import { MovieGrid, MovieSkeletons } from './MovieComponents';
import { readLastSearch, writeLastSearch } from './storage';
import { useDebounce } from './useDebounce';
import type { Movie } from './types';

export function HomePage() {
  const [query, setQuery] = useQueryState('q', parseAsString.withDefault('').withOptions({ history: 'replace', clearOnDefault: true }));
  const debouncedQuery = useDebounce(query.trim());
  const searching = debouncedQuery.length > 0;
  const sentinel = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => { if (!new URLSearchParams(window.location.search).has('q')) { const saved = readLastSearch(); if (saved) void setQuery(saved); } }, []); // URL takes precedence over local history.
  useEffect(() => { if (debouncedQuery) writeLastSearch(debouncedQuery); }, [debouncedQuery]);
  const moviesQuery = useInfiniteQuery({
    queryKey: ['movies', searching ? 'search' : 'trending', debouncedQuery],
    queryFn: ({ pageParam, signal }) => fetchMoviePage(searching ? 'search' : 'trending', pageParam, debouncedQuery, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => last.page < Math.min(last.total_pages, 500) ? last.page + 1 : undefined,
    staleTime: 2 * 60 * 1000
  });
  const movies = useMemo(() => {
    const seen = new Set<number>();
    return (moviesQuery.data?.pages.flatMap((page) => page.results) || []).filter((movie) => { if (seen.has(movie.id)) return false; seen.add(movie.id); return true; });
  }, [moviesQuery.data]);
  const hero: Movie | undefined = !searching ? movies.find((movie) => movie.backdrop_path) : undefined;
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !moviesQuery.hasNextPage || moviesQuery.isFetchingNextPage) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) void moviesQuery.fetchNextPage(); }, { rootMargin: '500px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [moviesQuery.hasNextPage, moviesQuery.isFetchingNextPage, moviesQuery.fetchNextPage, movies.length]);
  return <main>
    <motion.section layout={!reducedMotion} className={`discovery-hero ${searching ? 'is-searching' : ''}`}>
      <AnimatePresence mode="wait">{hero && !query ? <motion.div key={hero.id} className="hero-backdrop" style={{ backgroundImage: `url(${imageUrl(hero.backdrop_path, 'original')})` }} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: .52 }} exit={{ opacity: 0 }} /> : null}</AnimatePresence>
      <div className="hero-content container">
        {!searching && <div className="hero-copy"><span className="hero-marker">A world of cinema awaits</span><h1>Find a film<br />worth remembering.</h1><p>Discover what’s trending, follow your curiosity, and save the stories you love.</p></div>}
        <div className="search-area"><label htmlFor="movie-search">Search movies</label><TextField id="movie-search" placeholder="Titles, stories, worlds..." value={query} onChange={(event) => void setQuery(event.target.value.slice(0, 100))} fullWidth autoComplete="off" InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment>, endAdornment: query ? <InputAdornment position="end"><IconButton onClick={() => void setQuery('')} aria-label="Clear search" size="small"><CloseRoundedIcon /></IconButton></InputAdornment> : undefined }} /></div>
        {!searching && hero && <Link className="hero-feature" to={`/movie/${hero.id}`}><span>Featured today</span><strong>{hero.title}</strong><ArrowForwardRoundedIcon /></Link>}
      </div>
    </motion.section>
    <section className="results-section container" aria-live="polite">
      <div className="section-heading"><div><span className="section-accent" /><h2>{searching ? `Results for “${debouncedQuery}”` : 'Trending now'}</h2><p>{searching ? 'Films that match your search' : 'The films everyone is talking about'}</p></div>{moviesQuery.data && <span className="result-count">{moviesQuery.data.pages[0]?.total_results.toLocaleString()} films</span>}</div>
      {moviesQuery.isPending ? <MovieSkeletons /> : moviesQuery.isError && !moviesQuery.data ? <div className="message-panel"><Alert severity="error">{getErrorMessage(moviesQuery.error)}</Alert><Button variant="outlined" onClick={() => void moviesQuery.refetch()}>Retry</Button></div> : movies.length === 0 ? <div className="message-panel"><h3>No films found</h3><p>Try another title or check your spelling.</p><Button variant="outlined" onClick={() => void setQuery('')}>Show trending films</Button></div> : <><MovieGrid movies={movies} />{moviesQuery.isFetchingNextPage && <MovieSkeletons count={5} />}{moviesQuery.isFetchNextPageError && <Alert severity="error" sx={{ mt: 3 }}>Could not load more films. <Button onClick={() => void moviesQuery.fetchNextPage()}>Retry</Button></Alert>}<div ref={sentinel} className="scroll-sentinel" />{moviesQuery.hasNextPage && !moviesQuery.isFetchingNextPage && <Button className="load-more" variant="outlined" onClick={() => void moviesQuery.fetchNextPage()}>Load more</Button>}</>}
    </section>
  </main>;
}
