import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { parseAsString, useQueryState } from 'nuqs';
import { fetchMoviePage, getErrorMessage, imageUrl } from './api';
import type { BrowseCategory } from './api';
import { FeaturedCarousel } from './FeaturedCarousel';
import { MovieGrid, MovieSkeletons } from './MovieComponents';
import { readLastSearch, writeLastSearch } from './storage';
import { useDebounce } from './useDebounce';

const collections: { id: BrowseCategory; label: string; heading: string; description: string }[] = [
  { id: 'now_playing', label: 'In theaters', heading: 'In theaters now', description: 'Recent releases showing in cinemas.' },
  { id: 'trending', label: 'Trending', heading: 'Trending this week', description: 'The films getting attention on TMDb this week.' },
  { id: 'upcoming', label: 'Upcoming', heading: 'Upcoming releases', description: 'Films with release dates from today onward.' },
  { id: 'top_rated', label: 'Top rated', heading: 'Top rated films', description: 'Movies viewers rate highest on TMDb.' },
];
function isBrowseCategory(value: string): value is BrowseCategory {
  return collections.some((collection) => collection.id === value);
}

export function HomePage() {
  const [query, setQuery] = useQueryState('q', parseAsString.withDefault('').withOptions({ history: 'replace', clearOnDefault: true }));
  const [view, setView] = useQueryState('view', parseAsString.withDefault('now_playing').withOptions({ history: 'push', clearOnDefault: true }));
  const category: BrowseCategory = isBrowseCategory(view) ? view : 'now_playing';
  const collection = collections.find((item) => item.id === category)!;
  const hasQuery = query.trim().length > 0;
  const debouncedQuery = useDebounce(query.trim());
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const sentinel = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => { if (!new URLSearchParams(window.location.search).has('q')) { const saved = readLastSearch(); if (saved) void setQuery(saved); } }, []); // URL takes precedence over local history.
  useEffect(() => { if (debouncedQuery) writeLastSearch(debouncedQuery); }, [debouncedQuery]);
  useEffect(() => { setFeaturedIndex(0); }, [category]);

  const moviesQuery = useInfiniteQuery({
    queryKey: ['movies', hasQuery ? 'search' : category, hasQuery ? debouncedQuery : ''],
    queryFn: ({ pageParam, signal }) => fetchMoviePage(hasQuery ? 'search' : category, pageParam, debouncedQuery, signal),
    enabled: !hasQuery || debouncedQuery.length > 0,
    initialPageParam: 1,
    getNextPageParam: (last) => last.page < Math.min(last.total_pages, 500) ? last.page + 1 : undefined,
    staleTime: 2 * 60 * 1000,
  });
  const movies = useMemo(() => {
    const seen = new Set<number>();
    return (moviesQuery.data?.pages.flatMap((page) => page.results) || []).filter((movie) => { if (seen.has(movie.id)) return false; seen.add(movie.id); return true; });
  }, [moviesQuery.data]);
  const featuredMovies = !hasQuery ? (moviesQuery.data?.pages[0]?.results || []).filter((movie) => movie.backdrop_path).slice(0, 5) : [];
  const selectedIndex = Math.min(featuredIndex, Math.max(featuredMovies.length - 1, 0));
  const activeMovie = featuredMovies[selectedIndex];

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !moviesQuery.hasNextPage || moviesQuery.isFetchingNextPage) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) void moviesQuery.fetchNextPage(); }, { rootMargin: '500px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [moviesQuery.hasNextPage, moviesQuery.isFetchingNextPage, moviesQuery.fetchNextPage, movies.length]);

  return <main>
    <motion.section className={`discovery-hero ${hasQuery ? 'is-searching' : ''}`}>
      <AnimatePresence initial={false}>{activeMovie && <motion.div key={activeMovie.id} className="hero-backdrop" style={{ backgroundImage: `url(${imageUrl(activeMovie.backdrop_path, 'original')})` }} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reducedMotion ? undefined : { opacity: 0 }} transition={{ duration: reducedMotion ? .12 : .24, ease: [0.23, 1, 0.32, 1] }} aria-hidden="true" />}</AnimatePresence>
      <div className="hero-content container">
        <div className="hero-top-row"><div className="hero-intro"><span className="hero-marker">Movie Explorer</span><h1>{hasQuery ? 'Find a film worth your time.' : 'Your next movie night starts here.'}</h1></div>
          <div className="search-area"><label htmlFor="movie-search">Search movies</label><TextField id="movie-search" placeholder="Search by title" value={query} onChange={(event) => { const value = event.target.value.slice(0, 100); if (!value.trim()) writeLastSearch(''); void setQuery(value); }} fullWidth autoComplete="off" InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment>, endAdornment: query ? <InputAdornment position="end"><IconButton onClick={() => { writeLastSearch(''); void setQuery(''); }} aria-label="Clear search" size="small"><CloseRoundedIcon /></IconButton></InputAdornment> : undefined }} /></div>
        </div>
        {!hasQuery && (moviesQuery.isPending ? <div className="featured-glass featured-loading" aria-label="Loading featured movies"><div className="featured-label"><span>{collection.label}</span></div><div className="featured-loading-title" /><div className="featured-loading-meta" /><div className="featured-loading-line" /><div className="featured-loading-line short" /><div className="featured-loading-button" /></div> : <FeaturedCarousel movies={featuredMovies} activeIndex={selectedIndex} onSelect={setFeaturedIndex} collectionLabel={collection.label} />)}
      </div>
    </motion.section>
    <section className="results-section container" aria-live="polite">
      {!hasQuery && <div className="collection-switcher" role="group" aria-label="Browse movie collections">{collections.map((item) => <Button key={item.id} type="button" className={item.id === category ? 'is-active' : ''} aria-pressed={item.id === category} onClick={() => void setView(item.id)}>{item.label}</Button>)}</div>}
      <div className="section-heading"><div><span className="section-accent" /><h2>{hasQuery ? `Results for “${query.trim()}”` : collection.heading}</h2><p>{hasQuery ? 'Films matching your title search.' : collection.description}</p></div>{moviesQuery.data && <span className="result-count">{moviesQuery.data.pages[0]?.total_results.toLocaleString()} films</span>}</div>
      {moviesQuery.isPending ? <MovieSkeletons /> : moviesQuery.isError && !moviesQuery.data ? <div className="message-panel"><Alert severity="error">{getErrorMessage(moviesQuery.error)}</Alert><Button variant="outlined" onClick={() => void moviesQuery.refetch()}>Retry</Button></div> : movies.length === 0 ? <div className="message-panel"><h3>No films found</h3><p>Try another title or choose a different collection.</p><Button variant="outlined" onClick={() => { writeLastSearch(''); void setQuery(''); }}>Show movies in theaters</Button></div> : <><MovieGrid movies={movies} context={hasQuery ? undefined : category} />{moviesQuery.isFetchingNextPage && <MovieSkeletons count={5} />}{moviesQuery.isFetchNextPageError && <Alert severity="error" sx={{ mt: 3 }}>Could not load more films. <Button onClick={() => void moviesQuery.fetchNextPage()}>Retry</Button></Alert>}<div ref={sentinel} className="scroll-sentinel" />{moviesQuery.hasNextPage && !moviesQuery.isFetchingNextPage && <Button className="load-more" variant="outlined" onClick={() => void moviesQuery.fetchNextPage()}>Load more</Button>}</>}
    </section>
  </main>;
}
