import { useQuery } from '@tanstack/react-query';

export interface AuditLog {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
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

export function useAuditLogs(params?: {
  page?: number;
  limit?: number;
  entityType?: string;
  action?: string;
  branchId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async () => {
      // Mocking API for now as likely endpoint doesn't exist yet
      // const { data } = await apiClient.get<ApiResponse<AuditLogResponse>>('/audit-logs', { params });
      // return data.data;

      // Mock data
      return {
        logs: [
          {
            _id: '1',
            action: 'create',
            entityType: 'plant_batch',
            entityId: 'pb-123',
            details: { name: 'New Batch' },
            performedBy: { _id: 'u1', name: 'Admin User', email: 'admin@finecity.ae' },
            createdAt: new Date().toISOString(),
          },
          {
            _id: '2',
            action: 'update',
            entityType: 'care_task',
            entityId: 'ct-456',
            details: { status: 'completed' },
            performedBy: { _id: 'u2', name: 'John Doe', email: 'john@finecity.ae' },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          }
        ] as AuditLog[],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          pages: 1
        }
      };
    },
  });
}
