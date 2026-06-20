import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, LoginPayload, RegisterPayload } from "../types/auth";
import { authApi } from "../api/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }
    try {
      const me = await authApi.me(token);
      setUser(me);
    } catch {
      const refresh = localStorage.getItem(REFRESH_KEY);
      if (refresh) {
        try {
          const tokens = await authApi.refresh(refresh);
          localStorage.setItem(TOKEN_KEY, tokens.access_token);
          localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
          const me = await authApi.me(tokens.access_token);
          setUser(me);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_KEY);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (data: LoginPayload) => {
    const tokens = await authApi.login(data);
    localStorage.setItem(TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
    const me = await authApi.me(tokens.access_token);
    setUser(me);
  };

  const register = async (data: RegisterPayload) => {
    await authApi.register(data);
    await login({ email: data.email, password: data.password });
  };

  const logout = async () => {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (refresh) await authApi.logout(refresh).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}