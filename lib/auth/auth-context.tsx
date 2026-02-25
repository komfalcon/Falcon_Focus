import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { trpc } from "@/lib/trpc";

const AUTH_TOKEN_KEY = "falcon_access_token";
const AUTH_REFRESH_TOKEN_KEY = "falcon_refresh_token";
const AUTH_USER_KEY = "falcon_user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  altitude: number;
  level: string;
  streak: number;
  feathers: number;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function storeSecure(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    try { localStorage.setItem(key, value); } catch {}
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getSecure(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  return SecureStore.getItemAsync(key);
}

async function deleteSecure(key: string): Promise<void> {
  if (Platform.OS === "web") {
    try { localStorage.removeItem(key); } catch {}
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signInMutation = trpc.falconAuth.signin.useMutation();
  const signUpMutation = trpc.falconAuth.signup.useMutation();
  const refreshMutation = trpc.falconAuth.refresh.useMutation();

  const loadStoredAuth = useCallback(async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        getSecure(AUTH_TOKEN_KEY),
        getSecure(AUTH_USER_KEY),
      ]);

      if (storedToken && storedUser) {
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("[AuthContext] Failed to load stored auth:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const storeAuthData = useCallback(async (userData: AuthUser, tokens: { accessToken: string; refreshToken: string }) => {
    await Promise.all([
      storeSecure(AUTH_TOKEN_KEY, tokens.accessToken),
      storeSecure(AUTH_REFRESH_TOKEN_KEY, tokens.refreshToken),
      storeSecure(AUTH_USER_KEY, JSON.stringify(userData)),
    ]);
    setAccessToken(tokens.accessToken);
    setUser(userData);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await signInMutation.mutateAsync({ email, password });
    await storeAuthData(result.user, result.tokens);
  }, [signInMutation, storeAuthData]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const result = await signUpMutation.mutateAsync({ name, email, password });
    await storeAuthData(result.user, result.tokens);
  }, [signUpMutation, storeAuthData]);

  const signOut = useCallback(async () => {
    await Promise.all([
      deleteSecure(AUTH_TOKEN_KEY),
      deleteSecure(AUTH_REFRESH_TOKEN_KEY),
      deleteSecure(AUTH_USER_KEY),
    ]);
    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = await getSecure(AUTH_REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;

      const result = await refreshMutation.mutateAsync({ refreshToken });
      await Promise.all([
        storeSecure(AUTH_TOKEN_KEY, result.accessToken),
        storeSecure(AUTH_REFRESH_TOKEN_KEY, result.refreshToken),
      ]);
      setAccessToken(result.accessToken);
      return true;
    } catch {
      await signOut();
      return false;
    }
  }, [refreshMutation, signOut]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user && !!accessToken,
        signIn,
        signUp,
        signOut,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
