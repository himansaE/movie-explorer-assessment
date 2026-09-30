import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from './auth';
import { LoginPage } from './LoginPage';
import { http } from './api';

test('sign in blocks every credential control and shows a spinner while waiting', async () => {
  jest.spyOn(http, 'get').mockRejectedValueOnce(new Error('No session'));
  let completeLogin!: (value: { data: { username: string } }) => void;
  jest.spyOn(http, 'post').mockImplementationOnce(() => new Promise((resolve) => { completeLogin = resolve as typeof completeLogin; }));
  const user = userEvent.setup();
  render(<MemoryRouter><AuthProvider><LoginPage /></AuthProvider></MemoryRouter>);
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
  completeLogin({ data: { username: 'demo' } });
  await waitFor(() => expect(screen.getByRole('button', { name: /signed in/i })).toBeInTheDocument());
});
