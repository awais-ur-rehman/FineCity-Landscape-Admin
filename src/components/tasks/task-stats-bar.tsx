import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { TaskStats } from '@/lib/types';

interface TaskStatsBarProps {
  stats: TaskStats | undefined;
  isLoading: boolean;
}

export function TaskStatsBar({ stats, isLoading }: TaskStatsBarProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  const items = [
    { label: 'Total', value: stats?.total ?? 0, accent: 'bg-foreground/10 text-foreground' },
    { label: 'Completed', value: stats?.completed ?? 0, accent: 'bg-emerald-100 text-emerald-700' },
    { label: 'Pending', value: stats?.pending ?? 0, accent: 'bg-amber-100 text-amber-700' },
    { label: 'Overdue', value: stats?.overdue ?? 0, accent: 'bg-red-100 text-red-700' },
    { label: 'Missed', value: stats?.missed ?? 0, accent: 'bg-red-50 text-red-500' },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-5">
        {items.map((item) => (
          <Card key={item.label} className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <p className={cn('mt-1.5 text-2xl font-bold tabular-nums', item.accent.split(' ')[1])}>
                {item.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      {stats && stats.total > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-2.5 shadow-sm">
          <span className="text-xs font-medium text-muted-foreground">Completion rate</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <span className="text-sm font-semibold tabular-nums text-emerald-700">
            {stats.completionRate}%
          </span>
        </div>
      )}
    </div>
  );
}
