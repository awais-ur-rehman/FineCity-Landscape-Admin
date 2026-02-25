import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { TaskStats } from '@/lib/types';

interface TaskStatsBarProps {
  stats: TaskStats | undefined;
  isLoading: boolean;
}

export function TaskStatsBar({ stats, isLoading }: TaskStatsBarProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  const items = [
    { label: 'Total', value: stats?.total ?? 0, color: 'text-foreground' },
    { label: 'Completed', value: stats?.completed ?? 0, color: 'text-status-completed' },
    { label: 'Pending', value: stats?.pending ?? 0, color: 'text-status-pending' },
    { label: 'Overdue', value: stats?.overdue ?? 0, color: 'text-destructive' },
    { label: 'Missed', value: stats?.missed ?? 0, color: 'text-status-missed' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-center justify-between pt-4 pb-4">
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={`text-2xl font-semibold ${item.color}`}>{item.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      {stats && stats.total > 0 && (
        <div className="col-span-full">
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-status-completed transition-all"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <span className="text-sm font-medium">{stats.completionRate}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
