import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/lib/types';

export interface PlantType {
  _id: string;
  name: string;
  scientificName?: string;
  description?: string;
  careInstructions?: string;
  imageUrl?: string;
  isActive: boolean;
}

export function usePlantTypes() {
  return useQuery({
    queryKey: ['plant-types'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<PlantType[]>>('/plant-types');
      return data.data;
    },
  });
}

export function useCreatePlantType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<PlantType>) => {
      const { data: res } = await apiClient.post<ApiResponse<PlantType>>('/plant-types', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plant-types'] });
    },
  });
}

export function useUpdatePlantType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PlantType> }) => {
      const { data: res } = await apiClient.put<ApiResponse<PlantType>>(`/plant-types/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plant-types'] });
    },
  });
}

export function useDeletePlantType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/plant-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plant-types'] });
    },
  });
}
