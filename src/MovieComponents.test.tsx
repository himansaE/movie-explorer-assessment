import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { MovieCard } from './MovieComponents';
import type { Movie } from './types';

jest.mock('./api', () => ({
  fetchMovieDetails: jest.fn(),
  imageUrl: () => '',
}));
jest.mock('./useFavoriteAction', () => ({ useFavoriteAction: () => ({ signedIn: false, isFavorite: () => false, toggleOrSignIn: jest.fn() }) }));

const movie: Movie = { id: 348, title: 'Alien', poster_path: null, backdrop_path: null, release_date: '1979-05-25', vote_average: 8.2 };

function MovieLocation() {
  const location = useLocation();
  return <div data-testid="source-url">{(location.state as { from?: string } | null)?.from}</div>;
}

test('movie card captures the current search URL after a shallow URL update', () => {
  const previousUrl = window.location.pathname + window.location.search;
  try {
    window.history.replaceState({}, '', '/');
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={['/']}><Routes><Route path="/" element={<MovieCard movie={movie} />} /><Route path="/movie/:id" element={<MovieLocation />} /></Routes></MemoryRouter></QueryClientProvider>);
    window.history.replaceState({}, '', '/?q=Alien');
    fireEvent.click(screen.getByRole('link', { name: 'View Alien details' }));
    expect(screen.getByTestId('source-url')).toHaveTextContent('/?q=Alien');
  } finally {
    window.history.replaceState({}, '', previousUrl);
  }
});
