import 'dotenv/config';
import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { authHandler } from './auth.js';
import { tmdbHandler } from './tmdb.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '2kb' }));
app.all('/api/auth', authHandler);
app.all('/api/tmdb', tmdbHandler);
const build = join(process.cwd(), 'build');
if (existsSync(build)) {
  app.use(express.static(build));
  app.get('*', (_, res) => res.sendFile(join(build, 'index.html')));
}
const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`Movie Explorer server listening on http://localhost:${port}`));
