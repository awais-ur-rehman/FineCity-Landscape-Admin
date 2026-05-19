import { useState } from 'react';
import { useAuditLogs } from '@/hooks/use-audit-logs';
import type { AuditLog } from '@/hooks/use-audit-logs';
import { useBranch } from '@/hooks/use-branch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateShort } from '@/lib/utils';
import { Search } from 'lucide-react';

/** Convert details object into readable lines, e.g. "Reason: test" */
function formatDetailsSummary(details?: Record<string, unknown>): string {
  if (!details || Object.keys(details).length === 0) return '—';
  const lines = Object.entries(details)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => {
      const label = k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
      const labelCap = label.charAt(0).toUpperCase() + label.slice(1);
      return `${labelCap}: ${v}`;
    });
  return lines.join(' · ') || '—';
}

function DetailsCell({ log }: { log: AuditLog }) {
  const [open, setOpen] = useState(false);
  const summary = formatDetailsSummary(log.details);
  const hasDetails = summary !== '—';

  return (
    <>
      <button
        type="button"
        disabled={!hasDetails}
        onClick={() => hasDetails && setOpen(true)}
        className="text-left text-sm text-muted-foreground line-clamp-2 max-w-xs hover:text-foreground transition-colors disabled:cursor-default"
      >
        {summary}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            {Object.entries(log.details ?? {})
              .filter(([, v]) => v !== null && v !== undefined && v !== '')
              .map(([k, v]) => {
                const label = k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
                const labelCap = label.charAt(0).toUpperCase() + label.slice(1);
                return (
                  <div key={k}>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{labelCap}</p>
                    <p className="mt-0.5 text-sm text-foreground break-words">{String(v)}</p>
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState<string>('');
  const [page, setPage] = useState(1);
  const { currentBranch } = useBranch();

  const params = {
    ...(search && { search }),
    ...(action && { action }),
    ...(currentBranch && { branchId: currentBranch._id }),
    page,
    limit: 20,
  };

  const { data, isLoading } = useAuditLogs(params);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Audit Logs</h1>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>

        <Select
          value={action}
          onValueChange={(v) => {
            setAction(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Action Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
            <SelectItem value="LOGIN">Login</SelectItem>
            <SelectItem value="COMPLETE">Complete</SelectItem>
            <SelectItem value="SKIP">Skip</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No logs found
                </TableCell>
              </TableRow>
            ) : (
              data?.logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateShort(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{log.performedBy.name}</span>
                      <span className="text-xs text-muted-foreground">{log.performedBy.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize font-medium text-sm">{log.action.toLowerCase()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{(log.entity ?? '').replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <DetailsCell log={log} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data?.pagination && data.pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {data.pagination.pages} ({data.pagination.total} logs)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
