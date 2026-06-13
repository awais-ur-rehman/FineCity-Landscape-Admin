import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiResponse, Pagination, CareTask, TaskStats, FertilizerUsageHistoryResponse } from '@/lib/types';

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
  branchId?: string;
}

interface FertilizerUsageItem {
  fertilizerId: string;
  quantity: number;
  unit: 'ml' | 'g' | 'kg' | 'L';
}

interface FertilizerUsageHistoryParams {
  branchId?: string;
  batchId?: string;
  scheduleId?: string;
  completedBy?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

const TASK_KEYS = {
  all: ['care-tasks'] as const,
  lists: () => [...TASK_KEYS.all, 'list'] as const,
  list: (params: TaskListParams) => [...TASK_KEYS.lists(), params] as const,
  stats: (params: StatsParams) => [...TASK_KEYS.all, 'stats', params] as const,
  fertilizerHistory: (params: FertilizerUsageHistoryParams) =>
    [...TASK_KEYS.all, 'fertilizer-usage', params] as const,
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

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      notes,
      fertilizerUsages,
    }: {
      id: string;
      notes?: string;
      fertilizerUsages?: FertilizerUsageItem[];
    }) => {
      const { data } = await apiClient.post<ApiResponse<CareTask>>(
        `/care-tasks/${id}/complete`,
        { notes, fertilizerUsages },
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}

export function useFertilizerUsageHistory(params: FertilizerUsageHistoryParams = {}) {
  return useQuery({
    queryKey: TASK_KEYS.fertilizerHistory(params),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<FertilizerUsageHistoryResponse>>(
        '/care-tasks/fertilizer-usage',
        { params },
      );
      return data.data;
    },
    staleTime: 30_000,
  });
}

export function useSkipTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await apiClient.post<ApiResponse<CareTask>>(
        `/care-tasks/${id}/skip`,
        { reason },
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}
