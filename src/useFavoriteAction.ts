import { useLocation, useNavigate } from 'react-router';
import { useAuth } from './auth';
import { useFavorites } from './favorites';
import type { Movie } from './types';
import type { LoginRequestState } from './navigation';

export function useFavoriteAction() {
  const { username } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();
  return {
    signedIn: Boolean(username),
    isFavorite: (id: number) => Boolean(username) && isFavorite(id),
    toggleOrSignIn: (movie: Movie) => {
      if (username) { toggleFavorite(movie); return; }
      const state: LoginRequestState = {
        from: window.location.pathname + window.location.search,
        returnState: location.state,
        pendingFavorite: movie,
      };
      navigate('/login', { state });
    },
  };
}
