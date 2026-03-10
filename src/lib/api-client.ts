import axios from 'axios';
import { API_URL, TOKEN_KEYS } from './constants';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

/** Attach access token and branch ID to every request */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEYS.ACCESS);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Get current branch from zustand storage
  try {
    const branchStorage = localStorage.getItem('fc_branch_storage');
    if (branchStorage) {
      const parsed = JSON.parse(branchStorage);
      const branchId = parsed.state?.currentBranch?._id;
      if (branchId) {
        config.headers['X-Branch-ID'] = branchId;
      }
    }
  } catch {
    // Ignore parsing errors
  }

  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token!);
    }
  });
  failedQueue = [];
};

/** Auto-refresh on 401, redirect to login on refresh failure */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't retry refresh-token or login requests
    if (
      originalRequest.url?.includes('/auth/refresh-token') ||
      originalRequest.url?.includes('/auth/verify-otp')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH);
    if (!refreshToken) {
      isRefreshing = false;
      logout();
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
        refreshToken,
      });

      const newAccess = data.data.accessToken;
      const newRefresh = data.data.refreshToken;
      localStorage.setItem(TOKEN_KEYS.ACCESS, newAccess);
      localStorage.setItem(TOKEN_KEYS.REFRESH, newRefresh);

      processQueue(null, newAccess);

      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

function logout() {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
  localStorage.removeItem(TOKEN_KEYS.USER);
  window.location.href = '/login';
}

export default apiClient;
