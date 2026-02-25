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
      color: 'text-care-watering',
    },
    {
      label: 'Active Batches',
      value: activeBatches,
      icon: Leaf,
      color: 'text-brand',
    },
    {
      label: 'Active Employees',
      value: activeEmployees,
      icon: Users,
      color: 'text-care-pruning',
    },
    {
      label: 'Overdue Tasks',
      value: overdue,
      icon: AlertTriangle,
      color: overdue > 0 ? 'text-destructive' : 'text-muted-foreground',
      highlight: overdue > 0,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={cn(card.highlight && 'border-destructive/50 bg-destructive/5')}
        >
          <CardContent className="flex items-start justify-between pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-semibold">{card.value}</p>
              )}
              {card.sub && !isLoading && (
                <p className="text-xs text-muted-foreground">{card.sub}</p>
              )}
            </div>
            <card.icon className={cn('h-8 w-8', card.color)} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
