import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiResponse, Pagination, CareTask, TaskStats } from '@/lib/types';

interface TaskListParams {
  status?: string;
  date?: string;
  careType?: string;
  batchId?: string;
  assignedTo?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

interface TaskListResponse {
  tasks: CareTask[];
  pagination: Pagination;
}

interface StatsParams {
  from: string;
  to: string;
}

const TASK_KEYS = {
  all: ['care-tasks'] as const,
  lists: () => [...TASK_KEYS.all, 'list'] as const,
  list: (params: TaskListParams) => [...TASK_KEYS.lists(), params] as const,
  stats: (params: StatsParams) => [...TASK_KEYS.all, 'stats', params] as const,
};

export function useCareTasks(params: TaskListParams = {}) {
  return useQuery({
    queryKey: TASK_KEYS.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<TaskListResponse>>('/care-tasks', {
        params,
      });
      return data.data;
    },
  });
}

export function useTaskStats(params: StatsParams) {
  return useQuery({
    queryKey: TASK_KEYS.stats(params),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<TaskStats>>('/care-tasks/stats', {
        params,
      });
      return data.data;
    },
    enabled: !!params.from && !!params.to,
  });
}
