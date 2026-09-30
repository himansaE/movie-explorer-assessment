import React, { useState } from 'react';
import { Alert, Button, CircularProgress, IconButton, InputAdornment, TextField } from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import { motion, useReducedMotion } from 'motion/react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { getErrorMessage, useAuth } from './auth';
import { getDemoConfig } from './demoAuth';

export function LoginPage() {
  const { username: currentUser, checking, signIn } = useAuth();
  const demoConfig = getDemoConfig();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const returnTo = (location.state as { from?: string } | null)?.from || '/';
  if (checking) return <div className="page-loader"><CircularProgress aria-label="Checking session" /></div>;
  if (currentUser && phase === 'idle') return <Navigate to="/" replace />;
  const busy = phase !== 'idle';
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!username.trim() || !password) { setError('Enter your username and password.'); return; }
    setError(''); setPhase('submitting');
    try {
      await signIn(username, password);
      setPhase('success');
      window.setTimeout(() => navigate(returnTo, { replace: true }), reducedMotion ? 0 : 220);
    } catch (cause) { setError(getErrorMessage(cause)); setPhase('idle'); }
  }
  return <main className="login-page">
    <div className="login-ambient ambient-one" /><div className="login-ambient ambient-two" />
    <section className="login-story" aria-hidden="true">
      <div className="brand-mark"><MovieFilterRoundedIcon /> MOVIE EXPLORER</div>
      <div><span className="film-rule" /><h1>Every great film starts somewhere.</h1><p>Find the stories that stay with you.</p></div>
      <span className="login-footnote">Discover. Watch. Remember.</span>
    </section>
    <motion.section className="login-panel" initial={reducedMotion ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .42 }} aria-labelledby="login-title">
      <div className="mobile-brand"><MovieFilterRoundedIcon /> MOVIE EXPLORER</div>
      <span className="login-kicker">Your cinema, curated</span>
      <h2 id="login-title">Welcome back</h2>
      <p className="login-intro">Sign in to explore films and keep your favorites close.</p>
      <form onSubmit={submit} aria-busy={busy}>
        <div className="login-fields">
          <TextField label="Username" name="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} disabled={busy} fullWidth required inputProps={{ maxLength: 64 }} />
          <TextField label="Password" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} fullWidth required InputProps={{ endAdornment: <InputAdornment position="end"><IconButton aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)} disabled={busy} edge="end">{visible ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}</IconButton></InputAdornment> }} />
        </div>
        {error && <Alert severity="error" className="login-error">{error}</Alert>}
        <Button type="submit" className="login-submit" variant="contained" fullWidth disabled={busy}>{phase === 'submitting' ? <><CircularProgress size={19} color="inherit" /> Signing in...</> : phase === 'success' ? '✓ Signed in' : 'Sign in'}</Button>
      </form>
      <div className="demo-hint"><strong>Demo account</strong><span>Username: {demoConfig.username} · Password: {demoConfig.password}</span></div>
    </motion.section>
  </main>;
}
