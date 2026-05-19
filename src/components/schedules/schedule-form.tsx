import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { format } from 'date-fns';
import { useCreateSchedule, useUpdateSchedule } from '@/hooks/use-care-schedules';
import { usePlantBatches } from '@/hooks/use-plant-batches';
import { useEmployees } from '@/hooks/use-employees';
import { useFertilizers } from '@/hooks/use-fertilizers';
import { CARE_TYPES } from '@/lib/constants';
import { capitalize, careTypeColor } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { CareSchedule } from '@/lib/types';

const scheduleSchema = z.object({
  batchId: z.string().min(1, 'Batch is required'),
  careType: z.enum(CARE_TYPES),
  frequencyDays: z.number().int().min(1).max(365),
  scheduledTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be HH:mm format'),
  assignedTo: z.array(z.string()),
  recommendedFertilizers: z.array(z.string()).optional(),
  instructions: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof scheduleSchema>;

interface ScheduleFormProps {
  open: boolean;
  onClose: () => void;
  schedule: CareSchedule | null;
}

export function ScheduleForm({ open, onClose, schedule }: ScheduleFormProps) {
  const isEdit = !!schedule;
  const create = useCreateSchedule();
  const update = useUpdateSchedule();
  const batches = usePlantBatches({ status: 'active', limit: 100 });
  const employees = useEmployees({ limit: 100 });
  const { data: fertilizers } = useFertilizers({ isActive: true });

  const defaults: FormValues = {
    batchId: '', careType: 'watering', frequencyDays: 3, scheduledTime: '08:00',
    assignedTo: [], recommendedFertilizers: [], instructions: '', startDate: format(new Date(), 'yyyy-MM-dd'), isActive: true,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (schedule) {
      form.reset({
        batchId: schedule.batchId._id,
        careType: schedule.careType,
        frequencyDays: schedule.frequencyDays,
        scheduledTime: schedule.scheduledTime,
        assignedTo: schedule.assignedTo.map((u) => u._id),
        recommendedFertilizers: schedule.recommendedFertilizers?.map((f) => f._id) || [],
        instructions: schedule.instructions ?? '',
        startDate: format(new Date(schedule.startDate), 'yyyy-MM-dd'),
        isActive: schedule.isActive,
      });
    } else {
      form.reset(defaults);
    }
  }, [schedule, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        startDate: new Date(values.startDate).toISOString(),
        instructions: values.instructions || undefined,
      };
      if (isEdit) {
        await update.mutateAsync({ id: schedule._id, payload });
        toast.success('Schedule updated');
      } else {
        await create.mutateAsync(payload);
        toast.success('Schedule created — tasks will be generated');
      }
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to save schedule';
      toast.error(msg);
    }
  };

  const isPending = create.isPending || update.isPending;
  const selectedEmployees = form.watch('assignedTo');
  const selectedFertilizers = form.watch('recommendedFertilizers') || [];
  const currentCareType = form.watch('careType');

  const toggleEmployee = (empId: string) => {
    const current = form.getValues('assignedTo');
    if (current.includes(empId)) {
      form.setValue('assignedTo', current.filter((id) => id !== empId));
    } else {
      form.setValue('assignedTo', [...current, empId]);
    }
  };

  const toggleFertilizer = (fertId: string) => {
    const current = form.getValues('recommendedFertilizers') || [];
    if (current.includes(fertId)) {
      form.setValue('recommendedFertilizers', current.filter((id) => id !== fertId));
    } else {
      form.setValue('recommendedFertilizers', [...current, fertId]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Schedule' : 'Create Care Schedule'}</DialogTitle>
        </DialogHeader>
        <Form key={isEdit ? `edit-${schedule._id}` : 'create'} {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Batch selector */}
            <FormField control={form.control} name="batchId" render={({ field }) => (
              <FormItem>
                <FormLabel>Plant Batch</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select batch..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    {batches.data?.batches.map((b) => (
                      <SelectItem key={b._id} value={b._id}>
                        {b.name} — Zone {typeof b.zone === 'object' ? b.zone.name : b.zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Care type */}
              <FormField control={form.control} name="careType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Care Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {CARE_TYPES.map((c) => (
                        <SelectItem key={c} value={c}>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block h-2 w-2 rounded-full ${careTypeColor(c).replace('text-white', '').trim()}`} />
                            {capitalize(c)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Frequency */}
              <FormField control={form.control} name="frequencyDays" render={({ field }) => (
                <FormItem>
                  <FormLabel>Every N days</FormLabel>
                  <FormControl>
                    <Input
                      type="number" min={1} max={365}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Fertilizers multi-select (Only if careType === 'fertilizing') */}
            {currentCareType === 'fertilizing' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Recommended Fertilizers</label>
                <div className="flex flex-wrap gap-2 rounded-lg border p-3">
                  {fertilizers?.length ? fertilizers.map((fert) => (
                    <Badge
                      key={fert._id}
                      variant={selectedFertilizers.includes(fert._id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleFertilizer(fert._id)}
                    >
                      {fert.name}
                    </Badge>
                  )) : (
                    <span className="text-xs text-muted-foreground">No fertilizers found</span>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Time */}
              <FormField control={form.control} name="scheduledTime" render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Time</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Start date */}
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Employees multi-select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Assigned Employees</label>
              <p className="text-xs text-muted-foreground">
                Leave empty to assign to all employees
              </p>
              <div className="flex flex-wrap gap-2 rounded-lg border p-3">
                {employees.data?.users.length ? employees.data.users.map((emp) => (
                  <Badge
                    key={emp._id}
                    variant={selectedEmployees.includes(emp._id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleEmployee(emp._id)}
                  >
                    {emp.name}
                  </Badge>
                )) : (
                  <span className="text-xs text-muted-foreground">No employees found</span>
                )}
              </div>
            </div>

            {/* Instructions */}
            <FormField control={form.control} name="instructions" render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Water thoroughly, check drainage..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Active toggle */}
            <FormField control={form.control} name="isActive" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <FormLabel className="text-sm">Active</FormLabel>
                  <p className="text-xs text-muted-foreground">Inactive schedules won't generate tasks</p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />

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
