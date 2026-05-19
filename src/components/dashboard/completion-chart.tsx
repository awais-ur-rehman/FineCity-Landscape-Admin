import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useTaskStats } from '@/hooks/use-care-tasks';
import { useBranch } from '@/hooks/use-branch';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

type Range = 'today' | '7d' | '30d';

const COLORS: Record<string, string> = {
  completed: '#2E7D32',
  pending: '#F9A825',
  missed: '#B71C1C',
  skipped: '#BDBDBD',
};

const RANGE_LABEL: Record<Range, string> = {
  today: "Today",
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
};

export function CompletionChart() {
  const [range, setRange] = useState<Range>('today');
  const { currentBranch } = useBranch();

  const { from, to } = useMemo(() => {
    const now = new Date();
    const daysBack = range === 'today' ? 0 : range === '7d' ? 6 : 29;
    return {
      from: format(startOfDay(subDays(now, daysBack)), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
      to: format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
    };
  }, [range]);

  const { data: stats, isLoading } = useTaskStats({
    from,
    to,
    ...(currentBranch?._id && { branchId: currentBranch._id }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Task Completion</CardTitle>
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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base">Task Completion</CardTitle>
          {stats && !isEmpty && (
            <p className="text-sm text-muted-foreground mt-0.5">{stats.completionRate}% completion rate</p>
          )}
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(RANGE_LABEL) as Range[]).map(r => (
              <SelectItem key={r} value={r} className="text-xs">
                {RANGE_LABEL[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex h-64 items-center justify-center">
        {isEmpty ? (
          <p className="text-sm text-muted-foreground">No tasks in this period</p>
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
