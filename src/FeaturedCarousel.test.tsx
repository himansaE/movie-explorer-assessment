import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router';
import { FeaturedCarousel } from './FeaturedCarousel';
import type { Movie } from './types';

const movies: Movie[] = [
  { id: 11, title: 'First Film', overview: 'A story about finding a new favorite.', poster_path: null, backdrop_path: '/first.jpg', release_date: '2026-10-01', vote_average: 8.2 },
  { id: 22, title: 'Second Film', overview: 'A story worth watching next.', poster_path: null, backdrop_path: '/second.jpg', release_date: '2026-11-01', vote_average: 7.6 },
];

test('featured controls select another film and details link opens the selected movie', async () => {
  const user = userEvent.setup();
  const onSelect = jest.fn();
  render(<MemoryRouter><FeaturedCarousel movies={movies} activeIndex={0} onSelect={onSelect} collectionLabel="In theaters" /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'First Film' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /view movie details/i })).toHaveAttribute('href', '/movie/11');
  await user.click(screen.getByRole('button', { name: 'Next featured movie' }));
  expect(onSelect).toHaveBeenCalledWith(1);
  await user.click(screen.getByRole('button', { name: 'Show Second Film' }));
  expect(onSelect).toHaveBeenCalledWith(1);
});
