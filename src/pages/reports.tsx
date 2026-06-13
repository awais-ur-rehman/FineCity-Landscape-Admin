import { useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useTaskStats } from '@/hooks/use-care-tasks';
import { useBranch } from '@/hooks/use-branch';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export function ReportsPage() {
  const { currentBranch } = useBranch();
  const [from, setFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const statsParams = {
    from: `${from}T00:00:00.000Z`,
    to: `${to}T23:59:59.999Z`,
    ...(currentBranch && { branchId: currentBranch._id }),
  };

  const { data: stats, isLoading } = useTaskStats(statsParams);

  const handleExportTasks = async () => {
    try {
      const params = new URLSearchParams({ from: statsParams.from, to: statsParams.to });
      if (currentBranch) params.set('branchId', currentBranch._id);
      const res = await apiClient.get(`/care-tasks/export?${params}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data as BlobPart], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `care-tasks-${from}-to-${to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  };

  const handleExportBatches = async () => {
    try {
      const params = new URLSearchParams();
      if (currentBranch) params.set('branchId', currentBranch._id);
      const res = await apiClient.get(`/plant-batches/export?${params}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data as BlobPart], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plant-batches.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>

      {/* Date range selector */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">From</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">To</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
        </div>
      </div>

      {/* Task completion stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Task Completion Report</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportTasks}>
            <Download className="mr-2 h-4 w-4" />Download CSV
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Total', value: stats.total, color: 'text-foreground' },
                { label: 'Completed', value: stats.completed, color: 'text-green-600' },
                { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
                { label: 'Missed', value: stats.missed, color: 'text-red-600' },
                { label: 'Completion Rate', value: `${stats.completionRate ?? 0}%`, color: 'text-blue-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-lg border p-4 text-center">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No data for selected range</p>
          )}

          {/* By care type */}
          {stats?.byCareType && Object.keys(stats.byCareType).length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">By Care Type</h4>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">Type</th>
                      <th className="text-right px-4 py-2 font-medium">Total</th>
                      <th className="text-right px-4 py-2 font-medium">Completed</th>
                      <th className="text-right px-4 py-2 font-medium">Missed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.byCareType).map(([type, counts]) => (
                      <tr key={type} className="border-t">
                        <td className="px-4 py-2 capitalize">{type}</td>
                        <td className="text-right px-4 py-2">{(counts as Record<string, number>).total ?? 0}</td>
                        <td className="text-right px-4 py-2 text-green-600">{(counts as Record<string, number>).completed ?? 0}</td>
                        <td className="text-right px-4 py-2 text-red-600">{(counts as Record<string, number>).missed ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Employee performance */}
          {stats?.byEmployee && (stats.byEmployee as unknown[]).length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Employee Performance</h4>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">Employee</th>
                      <th className="text-right px-4 py-2 font-medium">Tasks Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.byEmployee as Array<{ name: string; completedCount: number }>).map((emp, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2">{emp.name}</td>
                        <td className="text-right px-4 py-2 font-medium text-green-600">{emp.completedCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plant batches export */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Plant Batches Export</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportBatches}>
            <Download className="mr-2 h-4 w-4" />Download CSV
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Export all active plant batches with their details (zone, category, quantity, etc.).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
