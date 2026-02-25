import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { careTypeColor, timeAgo, capitalize } from '@/lib/utils';
import type { CareTask } from '@/lib/types';

interface RecentActivityProps {
  tasks: CareTask[];
  isLoading: boolean;
}

export function RecentActivity({ tasks, isLoading }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Completions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No recent completions
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Badge className={careTypeColor(task.careType)}>
                    {capitalize(task.careType)}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{task.batchId.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.batchId.zone && `Zone ${task.batchId.zone}`}
                      {task.batchId.location && ` · ${task.batchId.location}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">
                    {task.completedBy?.name ?? 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {task.completedAt ? timeAgo(task.completedAt) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
