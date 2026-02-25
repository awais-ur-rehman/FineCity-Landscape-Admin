import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SkipDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}

export function SkipDialog({ open, onClose, onConfirm, isPending }: SkipDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setReason(''); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Skip Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium">Reason (required)</label>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g. Rained today, soil still moist..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!reason.trim() || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Skip Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
