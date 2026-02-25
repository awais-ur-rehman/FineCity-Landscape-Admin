import { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { TOKEN_KEYS, ROLES } from '@/lib/constants';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEYS.USER);
    if (!raw) return null;
    return JSON.parse(raw) as User;
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

  const sendOtp = useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiClient.post('/auth/send-otp', { email });
      return data;
    },
  });

  const verifyOtp = useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      const { data } = await apiClient.post('/auth/verify-otp', { email, otp });
      return data;
    },
    onSuccess: (response) => {
      const { accessToken, refreshToken, user } = response.data;

      if (user.role !== ROLES.ADMIN) {
        throw new Error('Access denied. Admin only.');
      }

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
      // Ignore errors — clear local state regardless
    } finally {
      localStorage.removeItem(TOKEN_KEYS.ACCESS);
      localStorage.removeItem(TOKEN_KEYS.REFRESH);
      localStorage.removeItem(TOKEN_KEYS.USER);
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      window.location.href = '/login';
    }
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    sendOtp,
    verifyOtp,
    logout,
  };
}
