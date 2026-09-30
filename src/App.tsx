import React, { useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme, CircularProgress, IconButton, Tooltip } from '@mui/material';
import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { BrowserRouter, Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router';
import { AuthProvider, useAuth } from './auth';
import { FavoritesProvider, useFavorites } from './favorites';
import { LoginPage } from './LoginPage';
import { HomePage } from './HomePage';
import { DetailsPage } from './DetailsPage';
import { FavoritesPage } from './FavoritesPage';
import './styles.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });
function readTheme(): 'dark' | 'light' { try { return localStorage.getItem('movieExplorer.theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; } }
function createAppTheme(mode: 'dark' | 'light') { return createTheme({ palette: { mode, primary: { main: mode === 'dark' ? '#E9B77F' : '#9F552B' }, secondary: { main: '#78B9C5' }, background: { default: mode === 'dark' ? '#101A28' : '#F5F1E9', paper: mode === 'dark' ? '#172637' : '#FFFFFF' }, text: { primary: mode === 'dark' ? '#F5F1E9' : '#192534', secondary: mode === 'dark' ? '#A9B4BD' : '#556474' } }, shape: { borderRadius: 12 }, typography: { fontFamily: '"DM Sans", sans-serif', button: { textTransform: 'none', fontWeight: 700 }, h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 }, h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 } }, components: { MuiButton: { styleOverrides: { root: { borderRadius: 11, minHeight: 44 } } }, MuiTextField: { defaultProps: { variant: 'outlined' } } } }); }
function Protected() {
  const { username, checking } = useAuth();
  const location = useLocation();
  if (checking) return <div className="page-loader"><CircularProgress aria-label="Checking session" /></div>;
  if (!username) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <AppShell />;
}
function AppShell() {
  const [mode, setMode] = useState<'dark' | 'light'>(readTheme);
  const { username, signOut } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  function toggleTheme() { const next = mode === 'dark' ? 'light' : 'dark'; setMode(next); try { localStorage.setItem('movieExplorer.theme', next); } catch {} }
  async function logout() { try { await signOut(); } finally { queryClient.clear(); navigate('/login', { replace: true }); } }
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  return <ThemeProvider theme={theme}><CssBaseline /><div className={`app-shell theme-${mode}`}>
    <header className="site-header"><div className="container header-inner"><Link className="site-brand" to="/"><span className="brand-icon"><MovieFilterRoundedIcon /></span><span>Movie Explorer</span></Link><nav className="desktop-nav" aria-label="Primary"><NavLink to="/" end>Explore</NavLink><NavLink to="/favorites">Favorites{favorites.length > 0 && <span className="nav-badge">{favorites.length}</span>}</NavLink></nav><div className="header-actions"><span className="header-greeting">Hi, {username}</span><Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}><IconButton aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>{mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}</IconButton></Tooltip><Tooltip title="Sign out"><IconButton aria-label="Sign out" onClick={() => void logout()}><LogoutRoundedIcon /></IconButton></Tooltip></div></div></header>
    <AnimatePresence mode="wait"><motion.div key={location.pathname} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: .24 }}><Outlet /></motion.div></AnimatePresence>
    <footer className="site-footer container"><span>Movie Explorer</span><span>Movie data and images provided by TMDb.</span></footer>
    <nav className="mobile-nav" aria-label="Mobile primary"><NavLink to="/" end><HomeRoundedIcon /><span>Explore</span></NavLink><NavLink to="/favorites"><FavoriteBorderRoundedIcon /><span>Favorites</span>{favorites.length > 0 && <span className="mobile-badge">{favorites.length}</span>}</NavLink></nav>
  </div></ThemeProvider>;
}
function NotFound() { return <main className="container not-found"><h1>That page isn’t here.</h1><p>There are still plenty of films to discover.</p><Link to="/">Go to Explore</Link></main>; }
function AppRoutes() { return <Routes><Route path="/login" element={<LoginPage />} /><Route element={<Protected />}><Route path="/" element={<HomePage />} /><Route path="/favorites" element={<FavoritesPage />} /><Route path="/movie/:id" element={<DetailsPage />} /><Route path="*" element={<NotFound />} /></Route></Routes>; }
export default function App() { return <QueryClientProvider client={queryClient}><ThemeProvider theme={createAppTheme('dark')}><CssBaseline /><BrowserRouter><NuqsAdapter><AuthProvider><FavoritesProvider><AppRoutes /></FavoritesProvider></AuthProvider></NuqsAdapter></BrowserRouter></ThemeProvider></QueryClientProvider>; }
