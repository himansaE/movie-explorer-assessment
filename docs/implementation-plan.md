# Movie Explorer implementation notes

The assessment is a client-only, mobile-first movie discovery app. A shared demo username and password are checked in the browser, and the tab session is held in sessionStorage. The login is intentionally bypassable and protects no private data. React Router owns navigation, TanStack Query owns TMDb request state, nuqs owns the shareable search URL, and React context owns demo login and favorites. Favorites and last search stay in localStorage. The app respects reduced-motion preferences.

Axios calls TMDb directly from the browser using a disposable, public `REACT_APP_TMDB_API_TOKEN`. The owner approved the public-token risk for this short-lived demo. There is no custom Node API, database, or Supabase service. The README explains local setup, checks, deployment, and security limits.
