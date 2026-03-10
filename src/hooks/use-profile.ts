import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { TOKEN_KEYS } from '@/lib/constants';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name?: string; email?: string; phone?: string }) => {
      const { data: res } = await apiClient.put('/users/profile', data);
      return res.data;
    },
    onSuccess: (updatedUser) => {
      // Update local storage
      const currentUser = localStorage.getItem(TOKEN_KEYS.USER);
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        const merged = { ...parsed, ...updatedUser };
        localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(merged));
      }
      
      // Invalidate queries if any
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Force reload to update UI if using simple local storage state
      window.location.reload(); 
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async () => {
      // Note: The current auth system seems to be OTP based, so password change might not be applicable
      // unless we are switching to password-based or adding password as an alternative.
      // If OTP only, this might be "Change Email" or similar.
      // Assuming for now we might want password support or this is a placeholder.
      // If strict OTP, maybe we don't need this?
      // Let's assume we stick to OTP for now and just allow profile updates.
      throw new Error('Password change not supported with OTP authentication');
    },
  });
}
