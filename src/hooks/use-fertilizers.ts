import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiResponse, Fertilizer } from '@/lib/types';

export function useFertilizers(params?: { branchId?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: ['fertilizers', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<{ fertilizers: Fertilizer[] }>>('/fertilizers', { params });
      return data.data.fertilizers;
    },
  });
}

export function useCreateFertilizer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Fertilizer>) => {
      const { data: res } = await apiClient.post<ApiResponse<Fertilizer>>('/fertilizers', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fertilizers'] });
    },
  });
}

export function useUpdateFertilizer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Fertilizer> }) => {
      const { data: res } = await apiClient.put<ApiResponse<Fertilizer>>(`/fertilizers/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fertilizers'] });
    },
  });
}

export function useDeleteFertilizer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/fertilizers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fertilizers'] });
    },
  });
}
