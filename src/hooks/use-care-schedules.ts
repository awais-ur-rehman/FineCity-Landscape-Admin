import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiResponse, Pagination, CareSchedule } from '@/lib/types';

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

const SCHEDULE_KEYS = {
  all: ['care-schedules'] as const,
  lists: () => [...SCHEDULE_KEYS.all, 'list'] as const,
  list: (params: ScheduleListParams) => [...SCHEDULE_KEYS.lists(), params] as const,
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
