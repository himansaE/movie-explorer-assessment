import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { readFavorites, writeFavorites } from './storage';
import type { FavoriteMovie, Movie } from './types';

interface FavoritesValue { favorites: FavoriteMovie[]; isFavorite: (id: number) => boolean; toggleFavorite: (movie: Movie) => void }
const FavoritesContext = createContext<FavoritesValue | null>(null);
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteMovie[]>(readFavorites);
  useEffect(() => writeFavorites(favorites), [favorites]);
  const value = useMemo<FavoritesValue>(() => ({
    favorites,
    isFavorite: (id) => favorites.some((movie) => movie.id === id),
    toggleFavorite: (movie) => setFavorites((current) => current.some((item) => item.id === movie.id) ? current.filter((item) => item.id !== movie.id) : [{ id: movie.id, title: movie.title, poster_path: movie.poster_path, release_date: movie.release_date, vote_average: movie.vote_average }, ...current])
  }), [favorites]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
export function useFavorites(): FavoritesValue {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error('FavoritesProvider missing');
  return value;
}
