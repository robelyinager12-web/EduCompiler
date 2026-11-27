import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchCurrentUser, loginRequest, registerRequest } from "../services/authService";
import type { User } from "../types/auth.types";
import { AUTH_EXPIRED_EVENT, TOKEN_KEY } from "../utils/constants";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // With a stored token we must ask the server who we are. Without one we are anonymous.
  const [status, setStatus] = useState<AuthStatus>(() =>
    localStorage.getItem(TOKEN_KEY) ? "loading" : "anonymous",
  );

  // On page load: restore the session from the stored token.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;

    let cancelled = false;
    fetchCurrentUser()
      .then((current) => {
        if (cancelled) return;
        setUser(current);
        setStatus("authenticated");
      })
      .catch(() => {
        // A 401 already cleared the token (see api.ts). A network error keeps it,
        // so a short server outage does not log the student out.
        if (!cancelled) setStatus("anonymous");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // The API client tells us when the token stops working.
  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setStatus("anonymous");
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    localStorage.setItem(TOKEN_KEY, result.token);
    setUser(result.user);
    setStatus("authenticated");
    return result.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await registerRequest(name, email, password);
    localStorage.setItem(TOKEN_KEY, result.token);
    setUser(result.user);
    setStatus("authenticated");
    return result.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
