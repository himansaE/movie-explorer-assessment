const SESSION_KEY = 'movieExplorer.demoSession';

export interface DemoConfig {
  username: string;
  password: string;
}

export function getDemoConfig(): DemoConfig {
  return {
    username: process.env.REACT_APP_DEMO_USERNAME || 'demo',
    password: process.env.REACT_APP_DEMO_PASSWORD || 'MovieExplorer2026!',
  };
}

export function validateDemoCredentials(username: string, password: string, config: DemoConfig = getDemoConfig()): boolean {
  return username.trim().toLowerCase() === config.username.toLowerCase() && password === config.password;
}

export function saveDemoSession(username: string): void {
  try { sessionStorage.setItem(SESSION_KEY, username.trim().toLowerCase()); } catch { /* Storage can be unavailable. */ }
}

export function readDemoSession(config: DemoConfig = getDemoConfig()): string | null {
  try {
    const username = sessionStorage.getItem(SESSION_KEY);
    return username === config.username.toLowerCase() ? username : null;
  } catch { return null; }
}

export function clearDemoSession(): void {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Storage can be unavailable. */ }
}
