import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiResponse, Pagination, CareSchedule } from '@/lib/types';
import type { CareType } from '@/lib/constants';

interface ScheduleListParams {
  batchId?: string;
  careType?: string;
  isActive?: string;
  page?: number;
  limit?: number;
}

interface ScheduleListResponse {
  schedules: CareSchedule[];
  pagination: Pagination;
}

export interface SchedulePayload {
  batchId: string;
  careType: CareType;
  frequencyDays: number;
  scheduledTime: string;
  assignedTo: string[];
  instructions?: string;
  startDate: string;
  isActive: boolean;
}

const SCHEDULE_KEYS = {
  all: ['care-schedules'] as const,
  lists: () => [...SCHEDULE_KEYS.all, 'list'] as const,
  list: (params: ScheduleListParams) => [...SCHEDULE_KEYS.lists(), params] as const,
  detail: (id: string) => [...SCHEDULE_KEYS.all, 'detail', id] as const,
};

export function useCareSchedules(params: ScheduleListParams = {}) {
  return useQuery({
    queryKey: SCHEDULE_KEYS.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<ScheduleListResponse>>('/care-schedules', {
        params,
      });
      return data.data;
    },
    enabled: params.batchId !== undefined ? !!params.batchId : true,
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SchedulePayload) => {
      const { data } = await apiClient.post<ApiResponse<CareSchedule>>(
        '/care-schedules',
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SCHEDULE_KEYS.lists() });
      qc.invalidateQueries({ queryKey: ['care-tasks'] });
    },
  });
}

export function useUpdateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<SchedulePayload> }) => {
      const { data } = await apiClient.put<ApiResponse<CareSchedule>>(
        `/care-schedules/${id}`,
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SCHEDULE_KEYS.lists() });
      qc.invalidateQueries({ queryKey: ['care-tasks'] });
    },
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/care-schedules/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SCHEDULE_KEYS.lists() });
      qc.invalidateQueries({ queryKey: ['care-tasks'] });
    },
  });
}
