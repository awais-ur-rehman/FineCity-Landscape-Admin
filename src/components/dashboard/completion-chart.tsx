import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { TaskStats } from '@/lib/types';

interface CompletionChartProps {
  stats: TaskStats | undefined;
  isLoading: boolean;
}

const COLORS: Record<string, string> = {
  completed: '#2E7D32',
  pending: '#F9A825',
  missed: '#B71C1C',
  skipped: '#BDBDBD',
};

export function CompletionChart({ stats, isLoading }: CompletionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today's Completion</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <Skeleton className="h-48 w-48 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const data = [
    { name: 'Completed', value: stats?.completed ?? 0 },
    { name: 'Pending', value: stats?.pending ?? 0 },
    { name: 'Missed', value: stats?.missed ?? 0 },
    { name: 'Skipped', value: stats?.skipped ?? 0 },
  ].filter((d) => d.value > 0);

  const isEmpty = data.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Today's Completion</CardTitle>
        {stats && !isEmpty && (
          <p className="text-sm text-muted-foreground">{stats.completionRate}% completion rate</p>
        )}
      </CardHeader>
      <CardContent className="flex h-64 items-center justify-center">
        {isEmpty ? (
          <p className="text-sm text-muted-foreground">No tasks scheduled today</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name.toLowerCase()] ?? '#BDBDBD'}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
