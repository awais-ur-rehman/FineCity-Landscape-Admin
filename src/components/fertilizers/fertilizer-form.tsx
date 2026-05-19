import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateFertilizer, useUpdateFertilizer } from '@/hooks/use-fertilizers';
import { useBranch } from '@/hooks/use-branch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import type { Fertilizer } from '@/lib/types';

const fertilizerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  brand: z.string().optional(),
  type: z.enum(['organic', 'chemical', 'bio']),
  npkRatio: z.string().optional(),
  description: z.string().optional(),
  defaultDosage: z.number().positive().optional(),
  defaultUnit: z.enum(['ml', 'g', 'kg', 'L']).optional(),
});

type FertilizerFormValues = z.infer<typeof fertilizerSchema>;

interface FertilizerFormProps {
  open: boolean;
  onClose: () => void;
  fertilizer: Fertilizer | null;
}

export function FertilizerForm({ open, onClose, fertilizer }: FertilizerFormProps) {
  const isEdit = !!fertilizer;
  const { currentBranch } = useBranch();
  const createFertilizer = useCreateFertilizer();
  const updateFertilizer = useUpdateFertilizer();

  const form = useForm<FertilizerFormValues>({
    resolver: zodResolver(fertilizerSchema),
    defaultValues: {
      name: '',
      brand: '',
      type: 'chemical' as const,
      npkRatio: '',
      description: '',
      defaultDosage: undefined,
      defaultUnit: undefined,
    },
  });

  useEffect(() => {
    if (fertilizer) {
      form.reset({
        name: fertilizer.name,
        brand: fertilizer.brand || '',
        type: fertilizer.type,
        npkRatio: fertilizer.npkRatio || '',
        description: fertilizer.description || '',
        defaultDosage: fertilizer.defaultDosage,
        defaultUnit: fertilizer.defaultUnit,
      });
    } else {
      form.reset({
        name: '',
        brand: '',
        type: 'chemical' as const,
        npkRatio: '',
        description: '',
        defaultDosage: undefined,
        defaultUnit: undefined,
      });
    }
  }, [fertilizer, form]);

  const onSubmit = async (values: FertilizerFormValues) => {
    try {
      if (isEdit) {
        await updateFertilizer.mutateAsync({ id: fertilizer._id, data: values });
        toast.success('Fertilizer updated');
      } else {
        await createFertilizer.mutateAsync({ ...values, branchId: currentBranch?._id });
        toast.success('Fertilizer created');
      }
      onClose();
    } catch {
      toast.error('Failed to save fertilizer');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Fertilizer' : 'Add Fertilizer'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. All Purpose" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Miracle-Gro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="npkRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NPK Ratio</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 10-10-10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="chemical">Chemical</SelectItem>
                      <SelectItem value="organic">Organic</SelectItem>
                      <SelectItem value="bio">Bio</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="defaultDosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Dosage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.1"
                        placeholder="e.g. 50"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="defaultUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Usage instructions or notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
