import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import { DetailsPage } from './DetailsPage';
import { fetchCredits, fetchMovieDetails, fetchVideos } from './api';
import type { Movie, MovieDetails } from './types';

jest.mock('./api', () => ({
  fetchMovieDetails: jest.fn(),
  fetchCredits: jest.fn(),
  fetchVideos: jest.fn(),
  getErrorMessage: (error: Error) => error.message,
  imageUrl: (path: string | null | undefined) => path ? `https://images.example${path}` : '',
}));
jest.mock('./useFavoriteAction', () => ({ useFavoriteAction: () => ({ signedIn: true, isFavorite: () => false, toggleOrSignIn: jest.fn() }) }));

const preview: Movie = { id: 7, title: 'Preview Film', poster_path: '/poster.jpg', backdrop_path: '/backdrop.jpg', release_date: '2026-10-01', vote_average: 7.4 };

test('details retain the selected movie preview and show content-shaped skeletons while loading', async () => {
  let resolveDetails!: (movie: MovieDetails) => void;
  (fetchMovieDetails as jest.Mock).mockReturnValue(new Promise<MovieDetails>((resolve) => { resolveDetails = resolve; }));
  (fetchCredits as jest.Mock).mockResolvedValue({ cast: [] });
  (fetchVideos as jest.Mock).mockResolvedValue({ results: [] });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={[{ pathname: '/movie/7', state: { from: '/?q=old-film&view=trending', preview } }]}><Routes><Route path="/movie/:id" element={<DetailsPage />} /></Routes></MemoryRouter></QueryClientProvider>);
  expect(screen.getByRole('heading', { name: 'Preview Film' })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Preview Film poster' })).toBeInTheDocument();
  expect(screen.getByLabelText('Loading movie details')).toBeInTheDocument();
  expect(screen.getByLabelText('Loading cast')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Back to explore' })).toHaveAttribute('href', '/?view=trending');
  resolveDetails({ ...preview, title: 'Full Film', overview: 'A complete movie overview.', runtime: 125, genres: [{ id: 1, name: 'Drama' }] });
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Full Film' })).toBeInTheDocument());
  expect(screen.getByText('A complete movie overview.')).toBeInTheDocument();
});
