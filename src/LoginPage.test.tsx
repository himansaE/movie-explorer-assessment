import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from './auth';
import { FavoritesProvider } from './favorites';
import { LoginPage } from './LoginPage';

beforeEach(() => { sessionStorage.clear(); localStorage.clear(); });

test('sign in blocks every credential control and shows a spinner during demo validation', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><AuthProvider><FavoritesProvider><LoginPage /></FavoritesProvider></AuthProvider></MemoryRouter>);
  const username = await screen.findByRole('textbox', { name: /username/i });
  const password = screen.getByLabelText(/^Password/);
  await user.type(username, 'demo');
  await user.type(password, 'MovieExplorer2026!');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(username).toBeDisabled();
  expect(password).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Show password' })).toBeDisabled();
  expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  expect(document.querySelector('form')).toHaveAttribute('aria-busy', 'true');
  await waitFor(() => expect(screen.getByRole('button', { name: /signed in/i })).toBeInTheDocument());
});

test('wrong demo password unlocks the form with an inline error', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><AuthProvider><FavoritesProvider><LoginPage /></FavoritesProvider></AuthProvider></MemoryRouter>);
  const username = await screen.findByRole('textbox', { name: /username/i });
  const password = screen.getByLabelText(/^Password/);
  await user.type(username, 'demo');
  await user.type(password, 'wrong');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByText('Incorrect username or password.')).toBeInTheDocument();
  expect(username).toBeEnabled();
  expect(password).toBeEnabled();
});
