import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useCreateEmployee, useUpdateEmployee, type EmployeePayload } from '@/hooks/use-employees';
import { useBranches } from '@/hooks/use-branches';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/lib/types';

const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Please enter a valid email'),
  phone: z.string().optional(),
  role: z.enum(['branch_manager', 'employee', 'super_admin']).default('employee'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

type FormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  employee: User | null;
}

/** Display label for a role value */
function roleLabel(role: string) {
  if (role === 'super_admin') return 'Super Admin';
  if (role === 'branch_manager') return 'Branch Manager';
  return 'Employee';
}

export function EmployeeForm({ open, onClose, employee }: EmployeeFormProps) {
  const isEdit = !!employee;
  const create = useCreateEmployee();
  const update = useUpdateEmployee();
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [role, setRole] = useState<'branch_manager' | 'employee' | 'super_admin'>('employee');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  // Only fetch branches when super_admin (they need to pick branches for the new user)
  const { data: branches = [] } = useBranches();

  const form = useForm<FormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: '', email: '', phone: '', role: 'employee', password: '' },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        name: employee.name,
        email: employee.email,
        phone: employee.phone ?? '',
        role: (employee.role as FormValues['role']) || 'employee',
        password: '',
      });
      setRole((employee.role as FormValues['role']) || 'employee');
      setSelectedBranches(employee.branches?.map((b) => b._id) ?? []);
    } else {
      form.reset({ name: '', email: '', phone: '', role: 'employee', password: '' });
      setRole('employee');
      setSelectedBranches([]);
    }
  }, [employee, form]);

  const toggleBranch = (branchId: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branchId) ? prev.filter((b) => b !== branchId) : [...prev, branchId],
    );
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: EmployeePayload = {
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        role,
        branches: isSuperAdmin ? selectedBranches : undefined,
        ...(!isEdit && { password: values.password || 'Finecity@123' }),
      };
      if (isEdit) {
        await update.mutateAsync({ id: employee._id, payload });
        toast.success('User updated');
      } else {
        await create.mutateAsync(payload);
        toast.success('User created');
      }
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? (isEdit ? 'Failed to update' : 'Failed to create');
      toast.error(msg);
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
        </DialogHeader>
        <Form key={isEdit ? 'edit' : 'create'} {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isSuperAdmin && (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={(v) => { field.onChange(v); setRole(v as FormValues['role']); }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="branch_manager">Branch Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@finecity.ae" type="email" {...field} disabled={isEdit} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input placeholder="+971 50 000 0000" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEdit && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password{' '}
                      <span className="text-xs text-muted-foreground">(leave blank for default)</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Min 8 characters" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Branch assignment — super_admin picks branches for the new user */}
            {isSuperAdmin && branches.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Assign Branches</FormLabel>
                <div className="rounded-md border p-3 space-y-2 max-h-40 overflow-y-auto">
                  {branches.map((branch) => (
                    <label
                      key={branch._id}
                      className="flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={selectedBranches.includes(branch._id)}
                        onCheckedChange={() => toggleBranch(branch._id)}
                      />
                      <span>{branch.name}</span>
                      <span className="text-xs text-muted-foreground">({branch.code})</span>
                    </label>
                  ))}
                </div>
                {selectedBranches.length === 0 && (
                  <p className="text-xs text-muted-foreground">No branch assigned — user won't see any data.</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export { roleLabel };
