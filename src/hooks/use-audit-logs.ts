import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiResponse, Pagination } from '@/lib/types';

export interface AuditLog {
  _id: string;
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, unknown>;
  performedBy: {
    _id: string;
    name: string;
    email: string;
  };
  branchId?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface AuditLogListResponse {
  logs: AuditLog[];
  pagination: Pagination;
}

interface UseAuditLogsParams {
  page?: number;
  limit?: number;
  entity?: string;
  action?: string;
  branchId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export function useAuditLogs(params?: UseAuditLogsParams) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<AuditLogListResponse>>('/audit-logs', {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          ...(params?.entity && { entity: params.entity }),
          ...(params?.action && { action: params.action }),
          ...(params?.branchId && { branchId: params.branchId }),
          ...(params?.startDate && { startDate: params.startDate }),
          ...(params?.endDate && { endDate: params.endDate }),
          ...(params?.search && { search: params.search }),
        },
      });
      return data.data;
    },
    staleTime: 30_000,
  });
}
