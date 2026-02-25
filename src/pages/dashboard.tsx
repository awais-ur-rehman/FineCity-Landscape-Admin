import { useState, useMemo } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useTaskStats, useCareTasks } from '@/hooks/use-care-tasks';
import { usePlantBatches } from '@/hooks/use-plant-batches';
import { useEmployees } from '@/hooks/use-employees';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { OverdueAlert } from '@/components/dashboard/overdue-alert';
import { CompletionChart } from '@/components/dashboard/completion-chart';
import { WeeklyTrend } from '@/components/dashboard/weekly-trend';
import { RecentActivity } from '@/components/dashboard/recent-activity';

export function DashboardPage() {
  const [overdueHidden, setOverdueHidden] = useState(false);
  const today = useMemo(() => new Date(), []);

  const todayStr = format(today, 'yyyy-MM-dd');
  const weekAgoStr = format(subDays(today, 6), 'yyyy-MM-dd');

  const todayStats = useTaskStats({
    from: format(startOfDay(today), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
    to: format(endOfDay(today), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
  });

  const weekStats = useTaskStats({
    from: format(startOfDay(subDays(today, 6)), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
    to: format(endOfDay(today), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
  });

  const batches = usePlantBatches({ status: 'active', limit: 1 });
  const employees = useEmployees({ limit: 1 });

  const recentTasks = useCareTasks({
    status: 'completed',
    from: weekAgoStr,
    to: todayStr,
    limit: 10,
  });

  const isLoading =
    todayStats.isLoading || weekStats.isLoading || batches.isLoading || employees.isLoading;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {!overdueHidden && (todayStats.data?.overdue ?? 0) > 0 && (
        <OverdueAlert count={todayStats.data!.overdue} onDismiss={() => setOverdueHidden(true)} />
      )}

      <StatsCards
        todayTotal={todayStats.data?.total ?? 0}
        todayCompleted={todayStats.data?.completed ?? 0}
        todayPending={todayStats.data?.pending ?? 0}
        activeBatches={batches.data?.pagination.total ?? 0}
        activeEmployees={employees.data?.pagination.total ?? 0}
        overdue={todayStats.data?.overdue ?? 0}
        isLoading={isLoading}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CompletionChart stats={todayStats.data} isLoading={todayStats.isLoading} />
        <WeeklyTrend weekStats={weekStats.data} isLoading={weekStats.isLoading} />
      </div>

      <RecentActivity tasks={recentTasks.data?.tasks ?? []} isLoading={recentTasks.isLoading} />
    </div>
  );
}
