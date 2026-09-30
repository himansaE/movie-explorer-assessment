import React from 'react';
import { Button } from '@mui/material';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { Link } from 'react-router';
import { MovieGrid } from './MovieComponents';
import { useFavorites } from './favorites';

export function FavoritesPage() {
  const { favorites } = useFavorites();
  return <main className="container favorites-page"><div className="page-heading"><span className="section-accent" /><h1>Your favorites</h1><p>All the stories you want to return to.</p></div>{favorites.length ? <><span className="result-count">{favorites.length} saved {favorites.length === 1 ? 'film' : 'films'}</span><MovieGrid movies={favorites} /></> : <div className="empty-favorites"><FavoriteBorderRoundedIcon sx={{ fontSize: 54 }} /><h2>Your list is waiting</h2><p>Save a film while exploring and you’ll find it here.</p><Button component={Link} to="/" variant="contained">Explore movies</Button></div>}</main>;
}
