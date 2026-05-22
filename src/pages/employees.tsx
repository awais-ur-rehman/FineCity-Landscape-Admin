import { useState } from 'react';
import {
  useEmployees,
  useDeactivateEmployee,
} from '@/hooks/use-employees';
import { useTaskStats } from '@/hooks/use-care-tasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Search, MoreHorizontal, Pencil, UserX, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateShort } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import type { User } from '@/lib/types';
import { EmployeeForm, roleLabel } from '@/components/employees/employee-form';

import { useBranch } from '@/hooks/use-branch';

export function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string>('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<User | null>(null);
  const [statsEmployee, setStatsEmployee] = useState<User | null>(null);
  const { currentBranch } = useBranch();

  const { data, isLoading, error, refetch } = useEmployees({
    search: search || undefined,
    role: role || undefined,
    ...(currentBranch && { branchId: currentBranch._id }),
    page,
    limit: 20,
  });
  const deactivate = useDeactivateEmployee();

  const now = new Date();
  const monthStats = useTaskStats({
    from: format(subDays(now, 30), "yyyy-MM-dd'T'00:00:00.000'Z'"),
    to: format(now, "yyyy-MM-dd'T'23:59:59.999'Z'"),
  });

  const handleDeactivate = async (emp: User) => {
    try {
      await deactivate.mutateAsync(emp._id);
      toast.success(`${emp.name} deactivated`);
    } catch {
      toast.error('Failed to deactivate employee');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditEmployee(null);
  };

  const getCompletedCount = (userId: string) => {
    return monthStats.data?.byEmployee.find((e) => e.userId === userId)?.completedCount ?? 0;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-muted-foreground">Failed to load employees</p>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Employees</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Add Employee
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>

        <Select
          value={role}
          onValueChange={(v) => {
            setRole(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="branch_manager">Branch Manager</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : (
        <div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Tasks (30d)</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {!data?.users.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : data.users.map((emp) => (
                  <TableRow key={emp._id}>
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{roleLabel(emp.role)}</Badge>
                    </TableCell>
                    <TableCell>{emp.phone || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={emp.isActive ? 'default' : 'outline'}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{getCompletedCount(emp._id)}</TableCell>
                    <TableCell>{formatDateShort(emp.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditEmployee(emp); setFormOpen(true); }}>
                            <Pencil className="mr-2 h-4 w-4" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatsEmployee(emp)}>
                            <BarChart3 className="mr-2 h-4 w-4" />View Stats
                          </DropdownMenuItem>
                          {emp.isActive && (
                            <DropdownMenuItem
                              onClick={() => handleDeactivate(emp)}
                              className="text-destructive"
                            >
                              <UserX className="mr-2 h-4 w-4" />Deactivate
                            </DropdownMenuItem>
                          )}
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
                Showing {(page - 1) * data.pagination.limit + 1}–
                {Math.min(page * data.pagination.limit, data.pagination.total)} of{' '}
                {data.pagination.total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= data.pagination.pages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <EmployeeForm open={formOpen} onClose={handleFormClose} employee={editEmployee} />

      {/* Stats dialog */}
      <Dialog open={!!statsEmployee} onOpenChange={(v) => !v && setStatsEmployee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{statsEmployee?.name} — Task Stats</DialogTitle>
          </DialogHeader>
          <EmployeeStatsContent
            userId={statsEmployee?._id ?? ''}
            stats={monthStats.data}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmployeeStatsContent({
  userId,
  stats,
}: {
  userId: string;
  stats: ReturnType<typeof useTaskStats>['data'];
}) {
  const emp = stats?.byEmployee.find((e) => e.userId === userId);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Last 30 Days</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Tasks Completed</p>
            <p className="text-2xl font-semibold">{emp?.completedCount ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Overall Completion Rate</p>
            <p className="text-2xl font-semibold">{stats?.completionRate ?? 0}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
