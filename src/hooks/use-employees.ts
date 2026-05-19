import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiResponse, Pagination, User } from '@/lib/types';

interface EmployeeListParams {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface EmployeeListResponse {
  users: User[];
  pagination: Pagination;
}

export interface EmployeePayload {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  branches?: string[];
}

const EMPLOYEE_KEYS = {
  all: ['employees'] as const,
  lists: () => [...EMPLOYEE_KEYS.all, 'list'] as const,
  list: (params: EmployeeListParams) => [...EMPLOYEE_KEYS.lists(), params] as const,
};

export function useEmployees(params: EmployeeListParams = {}) {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<EmployeeListResponse>>('/users', {
        params: { role: 'employee', ...params },
      });
      return data.data;
    },
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: EmployeePayload) => {
      const { data } = await apiClient.post<ApiResponse<User>>('/users', payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
    },
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<EmployeePayload> }) => {
      const { data } = await apiClient.put<ApiResponse<User>>(`/users/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
    },
  });
}

export function useDeactivateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
    },
  });
}
