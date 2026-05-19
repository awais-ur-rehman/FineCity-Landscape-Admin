import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useBranch } from '@/hooks/use-branch';
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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/lib/types';

const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Please enter a valid email'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'employee', 'super_admin']).default('employee'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

type FormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  employee: User | null;
}

export function EmployeeForm({ open, onClose, employee }: EmployeeFormProps) {
  const isEdit = !!employee;
  const create = useCreateEmployee();
  const update = useUpdateEmployee();
  const { currentBranch } = useBranch();
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [role, setRole] = useState<'admin' | 'employee' | 'super_admin'>('employee');

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
        role: employee.role || 'employee',
        password: '',
      });
      setRole(employee.role || 'employee');
    } else {
      form.reset({ name: '', email: '', phone: '', role: 'employee', password: '' });
      setRole('employee');
    }
  }, [employee, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        phone: values.phone || undefined,
        role,
        branches: currentBranch ? [currentBranch._id] : undefined,
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
          <DialogTitle>{isEdit ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
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
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={(v) => { field.onChange(v); setRole(v as any); }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
                      {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="employee@finecity.ae" type="email" {...field} disabled={isEdit} />
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
