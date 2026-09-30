import { sessionFromRequest } from './auth.js';

function pageNumber(raw) {
  const number = Number(raw ?? 1);
  if (!Number.isInteger(number) || number < 1 || number > 500) throw new Error('Invalid page');
  return number;
}
function movieId(raw) {
  if (!/^\d{1,10}$/.test(String(raw ?? '')) || Number(raw) < 1) throw new Error('Invalid movie ID');
  return String(Number(raw));
}

export function buildTmdbPath(params) {
  switch (params.kind) {
    case 'trending': return `/trending/movie/day?page=${pageNumber(params.page)}&language=en-US`;
    case 'search': {
      const query = String(params.query ?? '').trim();
      if (!query || query.length > 100) throw new Error('Invalid query');
      return `/search/movie?query=${encodeURIComponent(query)}&page=${pageNumber(params.page)}&include_adult=false&language=en-US`;
    }
    case 'details': return `/movie/${movieId(params.id)}?language=en-US`;
    case 'credits': return `/movie/${movieId(params.id)}/credits?language=en-US`;
    case 'videos': return `/movie/${movieId(params.id)}/videos?language=en-US`;
    default: throw new Error('Unknown operation');
  }
}

export async function tmdbHandler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!sessionFromRequest(req)) return res.status(401).json({ error: 'Sign in to view movies.' });
  const token = process.env.TMDB_API_TOKEN;
  if (!token || token.startsWith('replace-')) return res.status(503).json({ error: 'TMDb is not configured on the server.' });
  let path;
  try { path = buildTmdbPath(req.query || {}); }
  catch { return res.status(400).json({ error: 'Invalid movie request.' }); }
  try {
    const response = await fetch(`https://api.themoviedb.org/3${path}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) return res.status(502).json({ error: 'The movie service is unavailable. Please retry.' });
    res.setHeader('Cache-Control', 'private, max-age=60');
    return res.status(200).json(await response.json());
  } catch {
    return res.status(502).json({ error: 'The movie service is unavailable. Please retry.' });
  }
}
