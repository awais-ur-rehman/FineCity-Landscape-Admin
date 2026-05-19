import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { capitalize, careTypeColor, statusColor, formatDate } from '@/lib/utils';
import type { CareTask } from '@/lib/types';
import { useCareTypes } from '@/hooks/use-care-types';
import { useFertilizerUsageHistory } from '@/hooks/use-care-tasks';

interface TaskDetailDialogProps {
  task: CareTask | null;
  onClose: () => void;
}

export function TaskDetailDialog({ task, onClose }: TaskDetailDialogProps) {
  const { data: careTypes } = useCareTypes();
  const getCareTypeName = (id: string) => careTypes?.find(c => c._id === id)?.name || id;

  const isFertilizingCompleted = task?.careType === 'fertilizing' && task?.status === 'completed';
  const { data: usageHistory } = useFertilizerUsageHistory(
    isFertilizingCompleted ? { batchId: task?.batchId._id } : {},
  );
  const usageRecord = isFertilizingCompleted
    ? usageHistory?.records.find(r => r.taskId._id === task._id)
    : undefined;

  if (!task) return null;

  return (
    <Dialog open={!!task} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Batch</h4>
                <p className="text-lg font-medium">{task.batchId.name}</p>
                <p className="text-sm text-muted-foreground">{task.batchId.plantType}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Care Type</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={careTypeColor(task.careType)}>{getCareTypeName(task.careType)}</Badge>
                  <Badge className={statusColor(task.status)}>{capitalize(task.status)}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Scheduled</h4>
                <p>{formatDate(task.scheduledAt)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Assigned To</h4>
                <p>{task.assignedTo.map(u => u.name).join(', ')}</p>
              </div>
            </div>

            {task.status === 'completed' && (
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="font-medium mb-2">Completion Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Completed By:</span>
                    <p className="font-medium">{task.completedBy?.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Completed At:</span>
                    <p className="font-medium">{task.completedAt && formatDate(task.completedAt)}</p>
                  </div>
                </div>
                {task.notes && (
                  <div className="mt-4">
                    <span className="text-muted-foreground text-sm">Notes:</span>
                    <p className="mt-1">{task.notes}</p>
                  </div>
                )}
                {task.photoUrls && task.photoUrls.length > 0 && (
                  <div className="mt-4">
                    <span className="text-muted-foreground text-sm">Photos:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {task.photoUrls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={url}
                            alt={`Task photo ${i + 1}`}
                            className="h-24 w-24 rounded-lg object-cover border hover:opacity-80 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {task.status === 'skipped' && (
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/10">
                <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">Skip Details</h4>
                <div className="text-sm">
                  <span className="text-muted-foreground">Reason:</span>
                  <p className="mt-1 font-medium">{task.skipReason}</p>
                </div>
              </div>
            )}

            {/* Fertilizer Section */}
            {task.careType === 'fertilizing' && (
              <div>
                <Separator className="my-4" />
                <h4 className="font-medium mb-3">Fertilizer Usage</h4>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Recommended</h5>
                    {task.selectedFertilizers?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {task.selectedFertilizers.map(f => (
                          <Badge key={f._id} variant="outline">{f.name}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">None specified</p>
                    )}
                  </div>

                  {task.status === 'completed' && (
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-2">Actually Used</h5>
                      {usageRecord?.usages?.length ? (
                        <div className="space-y-1">
                          {usageRecord.usages.map((u, i) => (
                            <div key={i} className="flex items-center justify-between text-sm rounded-md border px-3 py-1.5">
                              <span className="font-medium">{u.fertilizerId.name}</span>
                              <span className="text-muted-foreground ml-4 tabular-nums">
                                {u.quantity} {u.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">None recorded</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {task.scheduleId.instructions && (
              <div>
                <Separator className="my-4" />
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Instructions</h4>
                <p className="text-sm bg-muted p-3 rounded-md">{task.scheduleId.instructions}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
