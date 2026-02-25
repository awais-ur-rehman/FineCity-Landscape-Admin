import { useQuery } from '@tanstack/react-query';
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
