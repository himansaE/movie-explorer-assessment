# Movie Explorer implementation notes

The assessment is a mobile-first movie discovery app for a reviewer. The reviewer signs in with one server-provisioned demo username and password, discovers trending films, searches with shareable URL state, opens details, and saves favorites. Favorites and the last search persist in localStorage. Authentication uses an HttpOnly signed cookie; no password or TMDb token enters the browser bundle. The TMDb proxy accepts only fixed operations and validates inputs. React Query owns remote data, nuqs owns the search URL, and React context owns auth/favorites/theme. Reduced-motion users get the same functionality without animated transitions. The project is built with Create React App and can run locally with pnpm or deploy to Vercel after environment variables are supplied.

Build order: server auth and proxy; client auth and persistence; discovery/search/infinite scrolling; detail/favorites; responsive styling; tests/build and README.
