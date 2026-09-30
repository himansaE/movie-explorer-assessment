import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { http, getErrorMessage } from './api';

interface AuthValue {
  username: string | null;
  checking: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    let active = true;
    http.get<{ username: string }>('/auth').then(({ data }) => { if (active) setUsername(data.username); }).catch(() => { if (active) setUsername(null); }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);
  const signIn = useCallback(async (name: string, password: string) => {
    const { data } = await http.post<{ username: string }>('/auth', { username: name, password });
    setUsername(data.username);
  }, []);
  const signOut = useCallback(async () => {
    try { await http.delete('/auth'); } finally { setUsername(null); }
  }, []);
  const value = useMemo(() => ({ username, checking, signIn, signOut }), [username, checking, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider missing');
  return value;
}
export { getErrorMessage };
