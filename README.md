# Movie Explorer

A mobile-first movie discovery assessment built with Create React App, TypeScript, React Router v7, MUI, Motion for React, TanStack Query, nuqs, Axios, and TMDb. The reviewer signs in with one pre-provisioned demo account, searches and explores films, opens details, and saves favorites.

## Run locally

1. Install Node.js 20+ and pnpm 10+.
2. Run `pnpm install`.
3. Copy `.env.example` to `.env`. Set `DEMO_USERNAME`, `DEMO_PASSWORD`, `AUTH_COOKIE_SECRET` (at least 32 random characters), and `TMDB_API_TOKEN` (TMDb API Read Access Token). Never prefix server secrets with `REACT_APP_`.
4. Run `pnpm dev` and open `http://localhost:3000`.

For this local assessment copy, the pre-provisioned reviewer account is **username `demo` / password `MovieExplorer2026!`** in the ignored `.env`. The published environment must set the same values for those credentials to work there. The password is intentionally shared for review and should never be used for a personal account.

`pnpm serve` serves the optimized `build/` folder and the same API at `http://localhost:3001` after `pnpm build`.

## What is included

- Real server-validated username/password login, signed HttpOnly cookie, session restoration, protected routes, logout, disabled login form and spinner during sign-in.
- Trending movies, debounced URL search (`?q=`), browser Back/Forward compatibility, and infinite scrolling with a manual Load more fallback.
- Details with overview, rating, genres, cast and trailer link; favorites and last search persist in localStorage even after refresh.
- Loading skeletons, empty and error states, dark/light theme, responsive mobile navigation, reduced-motion support, and Motion transitions.
- TMDb token held on the server behind a validated `/api/tmdb` proxy. The browser bundle contains no TMDb secret or password.

Supabase was removed per the latest project direction. The app uses a server-side demo account and browser localStorage, so favorites are specific to each browser rather than synced across devices.

## Test and build

```sh
pnpm test
pnpm test:server
pnpm typecheck
pnpm build
```

## Deployment

The repository includes `vercel.json` and Vercel Functions in `api/`. Import the project on Vercel or run `vercel` from this directory, then set `DEMO_USERNAME`, `DEMO_PASSWORD`, `AUTH_COOKIE_SECRET`, and `TMDB_API_TOKEN` as server environment variables in every target environment. Use `pnpm build` and output directory `build`. Test direct navigation to `/movie/:id` and `/favorites` after deployment. Deployment cannot show live films until a valid TMDb token is configured.

## Data and security

TMDb data and images are provided by [The Movie Database](https://www.themoviedb.org/). This project is not endorsed or certified by TMDb. The server only permits known movie endpoints, validates query/page/ID input, checks the signed session, limits upstream request duration, and never returns the token. The demo account is intentionally public for evaluation; use platform rate limits if deploying beyond a short-lived assessment. The browser stores favorites, last search, and theme; it does not store the password or manually manage the session token.
