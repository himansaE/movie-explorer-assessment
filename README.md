# Movie Explorer

A mobile-first movie discovery assessment built with Create React App, TypeScript, React Router v7, MUI, Motion for React, TanStack Query, nuqs, Axios, and TMDb.

## Run locally

1. Install Node.js 20+ and pnpm 10+.
2. Run `pnpm install`.
3. Copy `.env.example` to `.env`. Add a **disposable** TMDb API Read Access Token as `REACT_APP_TMDB_API_TOKEN`. The demo credentials are included in the example.
4. Run `pnpm dev` and open the local address shown in the terminal (normally `http://localhost:3000`). Restart the development server after changing `.env`.

The demo credentials are **username `demo` / password `MovieExplorer2026!`**. A missing or invalid TMDb token produces an error with a retry option; live movie data requires a valid token.

## What is included

- Demo-only login with a tab-scoped session, protected routes, logout, and a locked form with a spinner during sign-in.
- A cinematic five-film carousel with backdrop images, concise details, previous/next controls, and direct links to movie details.
- Purposeful collections for films in theaters, trending this week, upcoming releases, and top-rated films. The selected collection is in the URL as `?view=`. Upcoming releases are filtered to dates from today onward.
- Debounced title search in the URL as `?q=`, browser Back/Forward support, and infinite scrolling with a manual Load more fallback.
- Movie details with overview, rating, genres, cast, and trailer link. Favorites and the last search persist in localStorage after refresh; favorites belong to this browser.
- Loading skeletons, empty and error states, dark/light theme, responsive mobile navigation, reduced-motion support, and restrained Motion transitions.
- Direct TMDb requests through Axios. There is no custom Node API, database, or Supabase service.

## Demo security risk

**The login is a visual demo, not security.** The username and password are embedded in the browser build and can be read or bypassed by anyone. The session uses `sessionStorage`. Do not use this login to protect private data or real accounts.

**The TMDb token is public in this client-only version.** Create React App embeds `REACT_APP_` values in the browser build, and the browser sends this token with each TMDb request. Anyone can inspect and reuse it, which could consume its quota or lead to revocation. Use only a disposable token for this short-lived assessment, monitor usage, and revoke it afterward. Do not put a private or production token in `REACT_APP_TMDB_API_TOKEN`. The project owner explicitly approved this demo tradeoff.

## Test and build

```sh
pnpm test
pnpm typecheck
pnpm build
```

## Deployment

`vercel.json` configures a static Vercel deployment with SPA route rewrites. Import the project on Vercel or run `vercel` from this directory. Set `REACT_APP_TMDB_API_TOKEN`, `REACT_APP_DEMO_USERNAME`, and `REACT_APP_DEMO_PASSWORD` as build environment variables. Build with `pnpm build` and publish the `build` directory. Updating a `REACT_APP_` value requires a new build and deployment. Test direct navigation to `/movie/:id` and `/favorites` after deployment. The app cannot show live films until a valid TMDb token is configured.

## Data attribution

TMDb data and images are provided by [The Movie Database](https://www.themoviedb.org/). This project is not endorsed or certified by TMDb.
