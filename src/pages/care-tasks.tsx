import { useState, useMemo } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { useCareTasks, useTaskStats, useCompleteTask, useSkipTask } from '@/hooks/use-care-tasks';
import { usePlantBatches } from '@/hooks/use-plant-batches';
import { useEmployees } from '@/hooks/use-employees';
import { CARE_TYPES, TASK_STATUSES } from '@/lib/constants';
import { capitalize, careTypeColor, statusColor, formatDate } from '@/lib/utils';
import { TaskStatsBar } from '@/components/tasks/task-stats-bar';
import { SkipDialog } from '@/components/tasks/skip-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle2, SkipForward } from 'lucide-react';
import { toast } from 'sonner';

export function CareTasksPage() {
  const today = useMemo(() => new Date(), []);
  const [dateFrom, setDateFrom] = useState(format(today, 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(today, 'yyyy-MM-dd'));
  const [status, setStatus] = useState<string>('');
  const [careType, setCareType] = useState<string>('');
  const [batchId, setBatchId] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [skipTaskId, setSkipTaskId] = useState<string | null>(null);

  const statsParams = {
    from: format(startOfDay(new Date(dateFrom)), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
    to: format(endOfDay(new Date(dateTo)), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
  };

  const stats = useTaskStats(statsParams);
  const tasks = useCareTasks({
    ...(status && { status }),
    ...(careType && { careType }),
    ...(batchId && { batchId }),
    ...(assignedTo && { assignedTo }),
    from: statsParams.from,
    to: statsParams.to,
    page,
    limit: 50,
  });

  const batches = usePlantBatches({ status: 'active', limit: 100 });
  const employees = useEmployees({ limit: 100 });
  const complete = useCompleteTask();
  const skip = useSkipTask();

  const handleComplete = async (id: string) => {
    try {
      await complete.mutateAsync({ id });
      toast.success('Task marked complete');
    } catch {
      toast.error('Failed to complete task');
    }
  };

  const handleSkipConfirm = async (reason: string) => {
    if (!skipTaskId) return;
    try {
      await skip.mutateAsync({ id: skipTaskId, reason });
      toast.success('Task skipped');
      setSkipTaskId(null);
    } catch {
      toast.error('Failed to skip task');
    }
  };

  const handleBulkSkip = () => {
    if (selected.size === 0) return;
    setSkipTaskId([...selected][0]);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!tasks.data) return;
    const pending = tasks.data.tasks.filter((t) => t.status === 'pending').map((t) => t._id);
    if (selected.size === pending.length) setSelected(new Set());
    else setSelected(new Set(pending));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Care Tasks</h1>

      <TaskStatsBar stats={stats.data} isLoading={stats.isLoading} />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">From</label>
          <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="w-40" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">To</label>
          <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="w-40" />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{capitalize(s)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={careType} onValueChange={(v) => { setCareType(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Care Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {CARE_TYPES.map((c) => <SelectItem key={c} value={c}>{capitalize(c)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={batchId} onValueChange={(v) => { setBatchId(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Batch" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {batches.data?.batches.map((b) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={assignedTo} onValueChange={(v) => { setAssignedTo(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Employee" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {employees.data?.users.map((u) => <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button size="sm" variant="outline" onClick={handleBulkSkip}>
            <SkipForward className="mr-1 h-4 w-4" />Skip Selected
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      {/* Table */}
      {tasks.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : tasks.error ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <p className="text-muted-foreground">Failed to load tasks</p>
          <Button variant="outline" onClick={() => tasks.refetch()}>Retry</Button>
        </div>
      ) : (
        <div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selected.size > 0 && selected.size === (tasks.data?.tasks.filter((t) => t.status === 'pending').length ?? 0)}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Care Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Completed By</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {!tasks.data?.tasks.length ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      No tasks found for the selected filters
                    </TableCell>
                  </TableRow>
                ) : tasks.data.tasks.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell>
                      {task.status === 'pending' && (
                        <Checkbox checked={selected.has(task._id)} onCheckedChange={() => toggleSelect(task._id)} />
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{formatDate(task.scheduledAt)}</TableCell>
                    <TableCell className="font-medium">{task.batchId.name}</TableCell>
                    <TableCell>
                      <Badge className={careTypeColor(task.careType)}>{capitalize(task.careType)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor(task.status)}>{capitalize(task.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {task.assignedTo.length ? task.assignedTo.map((u) => u.name).join(', ') : 'All'}
                    </TableCell>
                    <TableCell className="text-sm">{task.completedBy?.name ?? '—'}</TableCell>
                    <TableCell>
                      {(task.status === 'pending' || task.status === 'missed') && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {task.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleComplete(task._id)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />Complete
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setSkipTaskId(task._id)}>
                              <SkipForward className="mr-2 h-4 w-4" />Skip
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {tasks.data?.pagination && tasks.data.pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {tasks.data.pagination.pages} ({tasks.data.pagination.total} tasks)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= tasks.data.pagination.pages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <SkipDialog
        open={!!skipTaskId}
        onClose={() => setSkipTaskId(null)}
        onConfirm={handleSkipConfirm}
        isPending={skip.isPending}
      />
    </div>
  );
}
