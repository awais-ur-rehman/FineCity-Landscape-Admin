import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useCreateBatch, useUpdateBatch } from '@/hooks/use-plant-batches';
import { PLANT_CATEGORIES, ZONES } from '@/lib/constants';
import { capitalize } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { PlantBatch } from '@/lib/types';

const batchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  plantType: z.string().min(1, 'Plant type is required'),
  scientificName: z.string().optional(),
  category: z.enum(PLANT_CATEGORIES),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  zone: z.string().min(1, 'Zone is required'),
  location: z.string().min(1, 'Location is required'),
  imageUrl: z.string().optional(),
  notes: z.string().optional(),
});

type BatchFormValues = z.infer<typeof batchSchema>;

interface BatchFormProps {
  open: boolean;
  onClose: () => void;
  batch: PlantBatch | null;
}

export function BatchForm({ open, onClose, batch }: BatchFormProps) {
  const isEdit = !!batch;
  const createBatch = useCreateBatch();
  const updateBatch = useUpdateBatch();

  const emptyDefaults: BatchFormValues = {
    name: '', plantType: '', scientificName: '', category: 'indoor',
    quantity: 1, zone: '', location: '', imageUrl: '', notes: '',
  };

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (batch) {
      form.reset({
        name: batch.name, plantType: batch.plantType,
        scientificName: batch.scientificName ?? '', category: batch.category,
        quantity: batch.quantity, zone: batch.zone, location: batch.location,
        imageUrl: batch.imageUrl ?? '', notes: batch.notes ?? '',
      });
    } else {
      form.reset(emptyDefaults);
    }
  }, [batch, form]);

  const onSubmit = async (values: BatchFormValues) => {
    try {
      // Strip empty optional strings
      const payload = {
        ...values,
        scientificName: values.scientificName || undefined,
        imageUrl: values.imageUrl || undefined,
        notes: values.notes || undefined,
      };

      if (isEdit) {
        await updateBatch.mutateAsync({ id: batch._id, payload });
        toast.success('Batch updated');
      } else {
        await createBatch.mutateAsync(payload);
        toast.success('Batch created');
      }
      onClose();
    } catch {
      toast.error(isEdit ? 'Failed to update batch' : 'Failed to create batch');
    }
  };

  const isPending = createBatch.isPending || updateBatch.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Plant Batch' : 'Add Plant Batch'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Areca Palm - Zone A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plantType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plant Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Areca Palm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="scientificName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scientific Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Chrysalidocarpus Lutescens" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PLANT_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {capitalize(c)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ZONES.map((z) => (
                          <SelectItem key={z} value={z}>
                            Zone {z}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Greenhouse 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Additional notes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
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
