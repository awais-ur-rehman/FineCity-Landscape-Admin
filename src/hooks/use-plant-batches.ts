import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiResponse, Pagination, PlantBatch, PlantBatchPayload } from '@/lib/types';

interface BatchListParams {
  search?: string;
  zone?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
  branchId?: string;
}

interface BatchListResponse {
  batches: PlantBatch[];
  pagination: Pagination;
}

const BATCH_KEYS = {
  all: ['plant-batches'] as const,
  lists: () => [...BATCH_KEYS.all, 'list'] as const,
  list: (params: BatchListParams) => [...BATCH_KEYS.lists(), params] as const,
  details: () => [...BATCH_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...BATCH_KEYS.details(), id] as const,
};

export function usePlantBatches(params: BatchListParams = {}) {
  return useQuery({
    queryKey: BATCH_KEYS.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<BatchListResponse>>('/plant-batches', {
        params,
      });
      return data.data;
    },
  });
}

export function usePlantBatch(id: string) {
  return useQuery({
    queryKey: BATCH_KEYS.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<PlantBatch>>(`/plant-batches/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PlantBatchPayload) => {
      const { data } = await apiClient.post<ApiResponse<PlantBatch>>('/plant-batches', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BATCH_KEYS.lists() });
    },
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<PlantBatchPayload> }) => {
      const { data } = await apiClient.put<ApiResponse<PlantBatch>>(
        `/plant-batches/${id}`,
        payload,
      );
      return data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: BATCH_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: BATCH_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/plant-batches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BATCH_KEYS.lists() });
    },
  });
}
