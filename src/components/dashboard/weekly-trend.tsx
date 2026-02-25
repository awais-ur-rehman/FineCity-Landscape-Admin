import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { TaskStats } from '@/lib/types';

interface WeeklyTrendProps {
  weekStats: TaskStats | undefined;
  isLoading: boolean;
}

export function WeeklyTrend({ weekStats, isLoading }: WeeklyTrendProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  // The stats endpoint gives aggregate totals, not daily breakdown.
  // We show a summary bar with key metrics from the week.
  const data = [
    { name: 'Completed', value: weekStats?.completed ?? 0, fill: '#2E7D32' },
    { name: 'Pending', value: weekStats?.pending ?? 0, fill: '#F9A825' },
    { name: 'Missed', value: weekStats?.missed ?? 0, fill: '#B71C1C' },
  ];

  const total = weekStats?.total ?? 0;
  const rate = weekStats?.completionRate ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">This Week</CardTitle>
        <p className="text-sm text-muted-foreground">
          {total} total tasks · {rate}% completion rate
        </p>
      </CardHeader>
      <CardContent className="h-64">
        {total === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No task data for this week</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2E7D32"
                strokeWidth={2}
                dot={{ fill: '#2E7D32', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
