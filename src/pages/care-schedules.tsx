import { useState } from 'react';
import { useCareSchedules, useDeleteSchedule } from '@/hooks/use-care-schedules';
import { usePlantBatches } from '@/hooks/use-plant-batches';
import { CARE_TYPES } from '@/lib/constants';
import { capitalize, careTypeColor } from '@/lib/utils';
import { ScheduleForm } from '@/components/schedules/schedule-form';
import { DeleteScheduleDialog } from '@/components/schedules/delete-schedule-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { CareSchedule } from '@/lib/types';

export function CareSchedulesPage() {
  const [batchId, setBatchId] = useState<string>('');
  const [careType, setCareType] = useState<string>('');
  const [isActive, setIsActive] = useState<string>('true');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState<CareSchedule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params = {
    ...(batchId && { batchId }),
    ...(careType && { careType }),
    ...(isActive && { isActive }),
    page,
    limit: 20,
  };

  const { data, isLoading, error, refetch } = useCareSchedules(params);
  const batches = usePlantBatches({ status: 'active', limit: 100 });
  const deleteSchedule = useDeleteSchedule();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSchedule.mutateAsync(deleteId);
      toast.success('Schedule deactivated and future tasks cancelled');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete schedule');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditSchedule(null);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-muted-foreground">Failed to load schedules</p>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Care Schedules</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Add Schedule
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={batchId} onValueChange={(v) => { setBatchId(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Batch" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {batches.data?.batches.map((b) => (
              <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={careType} onValueChange={(v) => { setCareType(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Care Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {CARE_TYPES.map((c) => <SelectItem key={c} value={c}>{capitalize(c)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={isActive} onValueChange={(v) => { setIsActive(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Care Type</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {!data?.schedules.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No care schedules found
                    </TableCell>
                  </TableRow>
                ) : data.schedules.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-medium">{s.batchId.name}</TableCell>
                    <TableCell>
                      <Badge className={careTypeColor(s.careType)}>{capitalize(s.careType)}</Badge>
                    </TableCell>
                    <TableCell>Every {s.frequencyDays} day{s.frequencyDays > 1 ? 's' : ''}</TableCell>
                    <TableCell>{s.scheduledTime}</TableCell>
                    <TableCell className="text-sm">
                      {s.assignedTo.length ? s.assignedTo.map((u) => u.name).join(', ') : 'All employees'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.isActive ? 'default' : 'outline'}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditSchedule(s); setFormOpen(true); }}>
                            <Pencil className="mr-2 h-4 w-4" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteId(s._id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data?.pagination && data.pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {data.pagination.pages} ({data.pagination.total} schedules)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= data.pagination.pages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <ScheduleForm open={formOpen} onClose={handleFormClose} schedule={editSchedule} />
      <DeleteScheduleDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isPending={deleteSchedule.isPending}
      />
    </div>
  );
}
