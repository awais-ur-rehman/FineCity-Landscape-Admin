import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { TOKEN_KEYS } from '@/lib/constants';
import type { AuthUser } from '@/hooks/use-auth';
import type { ApiResponse } from '@/lib/types';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name?: string; email?: string; phone?: string }) => {
      const { data: res } = await apiClient.put<ApiResponse<AuthUser>>('/users/me', data);
      return res.data;
    },
    onSuccess: (updatedUser) => {
      // Sync updated user into localStorage so next page load picks it up
      const raw = localStorage.getItem(TOKEN_KEYS.USER);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify({ ...parsed, ...updatedUser }));
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const { data: res } = await apiClient.put<ApiResponse<null>>('/auth/change-password', data);
      return res;
    },
  });
}
