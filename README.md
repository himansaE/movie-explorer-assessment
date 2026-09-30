# Movie Explorer

A mobile-first movie discovery assessment built with Create React App, TypeScript, React Router v7, MUI, Motion for React, TanStack Query, nuqs, Axios, and TMDb. Reviewers can search and explore films, open details, and save favorites.

## Run locally

1. Install Node.js 20+ and pnpm 10+.
2. Run `pnpm install`.
3. Copy `.env.example` to `.env`. Add a **disposable** TMDb API Read Access Token as `REACT_APP_TMDB_API_TOKEN`. The demo username and password are already shown in the example.
4. Run `pnpm dev` and open `http://localhost:3000`.

The demo credentials are **username `demo` / password `MovieExplorer2026!`**. They are intentionally public and shown on the login screen. Restart the development server after changing `.env`. An older `TMDB_API_TOKEN` setting is ignored by this client-only version. If the token is missing or invalid, the app shows an error with a retry option; live films require a valid token.

## What is included

- Demo-only browser login, tab-scoped session, protected navigation, logout, and a disabled form with spinner during sign-in.
- Trending movies, debounced URL search (`?q=`), browser Back/Forward compatibility, and infinite scrolling with a manual Load more fallback.
- Details with overview, rating, genres, cast and trailer link; favorites and last search persist in localStorage after refresh.
- Loading skeletons, empty and error states, dark/light theme, responsive mobile navigation, reduced-motion support, and Motion transitions.
- Direct TMDb requests from the React app through Axios. There is no custom Node API, database, or Supabase service.

Favorites are specific to each browser and are not synced across devices.

## Demo security risk

**The login is a visual demo, not security.** The username and password are included in the browser build and can be read or bypassed by anyone. The session is stored in `sessionStorage`. Do not use this login to protect private data or real accounts.

**The TMDb token is public in this client-only version.** Create React App embeds every `REACT_APP_` value into the browser build, and each TMDb request sends the token from the browser. Anyone can inspect and reuse it, which can consume its quota or lead to revocation. Use a disposable token for this short-lived assessment, monitor its usage, and revoke it afterward. Do not put a private or production token in `REACT_APP_TMDB_API_TOKEN`. The project owner explicitly approved this tradeoff for the demo.

## Test and build

```sh
pnpm test
pnpm typecheck
pnpm build
```

## Deployment

The repository includes `vercel.json` for static deployment. Import the project on Vercel or run `vercel` from this directory. Set `REACT_APP_TMDB_API_TOKEN`, `REACT_APP_DEMO_USERNAME`, and `REACT_APP_DEMO_PASSWORD` as build environment variables. Build with `pnpm build` and publish the `build` directory. Test direct navigation to `/movie/:id` and `/favorites` after deployment. Updating any `REACT_APP_` value requires a new build and deployment.

## Data attribution

TMDb data and images are provided by [The Movie Database](https://www.themoviedb.org/). This project is not endorsed or certified by TMDb.
