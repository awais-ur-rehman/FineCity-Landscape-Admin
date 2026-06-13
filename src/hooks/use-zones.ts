import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/lib/types';

export interface Zone {
  _id: string;
  name: string;
  code: string;
  branchId: { _id: string; name: string };
  description?: string;
  isActive: boolean;
}

export function useZones(params?: { branchId?: string }) {
  return useQuery({
    queryKey: ['zones', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Zone[]>>('/zones', { params });
      return data.data;
    },
  });
}

export interface ZoneCreatePayload {
  name: string;
  code: string;
  description?: string;
  branchId: string;
}

export function useCreateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ZoneCreatePayload) => {
      const { data: res } = await apiClient.post<ApiResponse<Zone>>('/zones', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Zone> }) => {
      const { data: res } = await apiClient.put<ApiResponse<Zone>>(`/zones/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/zones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
}
