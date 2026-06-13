import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';
import type { TaskStats } from '@/lib/types';

interface EmployeeLeaderboardProps {
  weekStats?: TaskStats;
  isLoading: boolean;
}

const MEDAL = ['🥇', '🥈', '🥉'];

export function EmployeeLeaderboard({ weekStats, isLoading }: EmployeeLeaderboardProps) {
  const leaders = weekStats?.byEmployee ?? [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Trophy className="h-4 w-4 text-amber-500" />
          Top Performers (Last 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-10" />
              </div>
            ))}
          </div>
        ) : leaders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No completions recorded this week
          </p>
        ) : (
          <ol className="space-y-3">
            {leaders.map((emp, idx) => (
              <li key={emp.userId} className="flex items-center gap-3">
                <span className="w-7 text-center text-lg leading-none">
                  {idx < 3 ? MEDAL[idx] : <span className="text-sm text-muted-foreground font-medium">{idx + 1}</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{emp.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-primary">
                  {emp.completedCount} tasks
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
