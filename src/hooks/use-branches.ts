import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/lib/types';

export interface Branch {
  _id: string;
  name: string;
  code: string;
  location: string;
  isActive: boolean;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface BranchesResponse {
  branches: Branch[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<BranchesResponse>>('/branches');
      const payload = data.data as BranchesResponse | Branch[];
      return Array.isArray(payload) ? payload : (payload?.branches ?? []);
    },
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Branch>) => {
      const { data: res } = await apiClient.post<ApiResponse<Branch>>('/branches', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Branch> }) => {
      const { data: res } = await apiClient.put<ApiResponse<Branch>>(`/branches/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/branches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
}
