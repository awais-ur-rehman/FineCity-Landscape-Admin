import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OverdueAlertProps {
  count: number;
  onDismiss: () => void;
}

export function OverdueAlert({ count, onDismiss }: OverdueAlertProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <p className="text-sm font-medium text-destructive">
          {count} overdue {count === 1 ? 'task' : 'tasks'} — action required
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={onDismiss} className="h-8 w-8">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
