import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';

interface DeleteScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeleteScheduleDialog({ open, onClose, onConfirm, isPending }: DeleteScheduleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Schedule
          </DialogTitle>
          <DialogDescription>
            This will deactivate the schedule and cancel all future pending tasks.
            Completed tasks will not be affected. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
