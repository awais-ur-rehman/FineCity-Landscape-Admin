import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList, Leaf, Users, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  todayTotal: number;
  todayCompleted: number;
  todayPending: number;
  activeBatches: number;
  activeEmployees: number;
  overdue: number;
  isLoading: boolean;
}

export function StatsCards({
  todayTotal,
  todayCompleted,
  todayPending,
  activeBatches,
  activeEmployees,
  overdue,
  isLoading,
}: StatsCardsProps) {
  const cards = [
    {
      label: "Today's Tasks",
      value: todayTotal,
      sub: `${todayCompleted} done · ${todayPending} pending`,
      icon: ClipboardList,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Active Batches',
      value: activeBatches,
      icon: Leaf,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Active Employees',
      value: activeEmployees,
      icon: Users,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Overdue Tasks',
      value: overdue,
      icon: AlertTriangle,
      iconBg: overdue > 0 ? 'bg-red-50' : 'bg-muted',
      iconColor: overdue > 0 ? 'text-destructive' : 'text-muted-foreground',
      highlight: overdue > 0,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={cn(
            'border shadow-sm',
            card.highlight && 'border-destructive/40 bg-red-50/30',
          )}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {card.label}
                </p>
                <div className="mt-2">
                  {isLoading ? (
                    <Skeleton className="h-8 w-14" />
                  ) : (
                    <p className={cn(
                      'text-3xl font-bold tabular-nums leading-none',
                      card.highlight ? 'text-destructive' : 'text-foreground',
                    )}>
                      {card.value}
                    </p>
                  )}
                </div>
                {!isLoading && (
                  <p className="mt-1.5 min-h-[1rem] text-xs text-muted-foreground">
                    {card.sub ?? ''}
                  </p>
                )}
              </div>
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', card.iconBg)}>
                <card.icon className={cn('h-5 w-5', card.iconColor)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
