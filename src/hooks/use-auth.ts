import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { TOKEN_KEYS } from '@/lib/constants';
import type { ApiResponse } from '@/lib/types';

export interface AuthUser {
  id: string;
  _id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'branch_manager' | 'employee';
  phone?: string;
  branches: Array<{ _id: string; name: string; code: string }>;
  currentBranch?: { _id: string; name: string; code: string };
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEYS.USER);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function isLoggedIn(): boolean {
  return !!localStorage.getItem(TOKEN_KEYS.ACCESS);
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: getStoredUser(),
    isAuthenticated: isLoggedIn(),
    isLoading: false,
  });

  useEffect(() => {
    setAuthState({
      user: getStoredUser(),
      isAuthenticated: isLoggedIn(),
      isLoading: false,
    });
  }, []);

  const login = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
      return data;
    },
    onSuccess: (response) => {
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
      localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
      localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    },
  });

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Clear local state regardless of server response
    } finally {
      localStorage.removeItem(TOKEN_KEYS.ACCESS);
      localStorage.removeItem(TOKEN_KEYS.REFRESH);
      localStorage.removeItem(TOKEN_KEYS.USER);
      localStorage.removeItem('fc_branch_storage');
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      window.location.href = '/login';
    }
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    logout,
  };
}
