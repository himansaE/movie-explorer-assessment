import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { clearDemoSession, getDemoConfig, readDemoSession, saveDemoSession, validateDemoCredentials } from './demoAuth';

interface AuthValue {
  username: string | null;
  checking: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(() => readDemoSession());
  const signIn = useCallback(async (name: string, password: string) => {
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    const config = getDemoConfig();
    if (!validateDemoCredentials(name, password, config)) throw new Error('Incorrect username or password.');
    saveDemoSession(config.username);
    setUsername(config.username);
  }, []);
  const signOut = useCallback(async () => {
    clearDemoSession();
    setUsername(null);
  }, []);
  const value = useMemo(() => ({ username, checking: false, signIn, signOut }), [username, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider missing');
  return value;
}
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please retry.';
}
