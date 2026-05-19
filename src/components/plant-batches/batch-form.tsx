import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useCreateBatch, useUpdateBatch } from '@/hooks/use-plant-batches';
import { usePlantTypes } from '@/hooks/use-plant-types';
import { useBranch } from '@/hooks/use-branch';
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
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import type { PlantBatch } from '@/lib/types';
import type { Zone } from '@/hooks/use-zones';
import type { Category } from '@/hooks/use-categories';

const batchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  plantType: z.string().min(1, 'Plant type is required'),
  scientificName: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
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
  zones?: Zone[];
  categories?: Category[];
}

export function BatchForm({ open, onClose, batch, zones, categories }: BatchFormProps) {
  const isEdit = !!batch;
  const createBatch = useCreateBatch();
  const updateBatch = useUpdateBatch();
  const { data: plantTypes } = usePlantTypes();
  const { currentBranch } = useBranch();
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePublicId, setImagePublicId] = useState<string | null>(null);

  const emptyDefaults: BatchFormValues = {
    name: '', plantType: '', scientificName: '', category: '',
    quantity: 1, zone: '', location: '', imageUrl: '', notes: '',
  };

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (batch) {
      form.reset({
        name: batch.name,
        plantType: typeof batch.plantType === 'object' ? batch.plantType._id : batch.plantType,
        scientificName: batch.scientificName ?? '',
        category: typeof batch.category === 'object' ? batch.category._id : batch.category,
        quantity: batch.quantity,
        zone: typeof batch.zone === 'object' ? batch.zone._id : batch.zone,
        location: batch.location,
        imageUrl: batch.imageUrl ?? '',
        notes: batch.notes ?? '',
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
        await createBatch.mutateAsync({ ...payload, branchId: currentBranch?._id });
        toast.success('Batch created');
      }
      onClose();
    } catch {
      toast.error(isEdit ? 'Failed to update batch' : 'Failed to create batch');
    }
  };

  const isPending = createBatch.isPending || updateBatch.isPending;

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await apiClient.post('/plant-batches/upload-image', formData);
      form.setValue('imageUrl', data.data.url);
      setImagePublicId(data.data.publicId);
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setImageUploading(false);
      // Reset file input so the same file can be re-selected after removal
      e.target.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (imagePublicId) {
      try {
        await apiClient.delete('/plant-batches/delete-image', { data: { publicId: imagePublicId } });
      } catch {
        // Non-critical — clear locally anyway
      }
      setImagePublicId(null);
    }
    form.setValue('imageUrl', '');
  };

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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select plant type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {plantTypes?.map((pt) => (
                          <SelectItem key={pt._id} value={pt._id}>
                            {pt.name}
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
                        {categories?.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.name}
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
                        {zones?.map((z) => (
                          <SelectItem key={z._id} value={z._id}>
                            {z.name}
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

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Batch Image</label>
              {form.watch('imageUrl') ? (
                <div className="relative inline-block">
                  <img
                    src={form.watch('imageUrl')}
                    alt="Batch"
                    className="h-32 w-32 rounded-lg object-cover border"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors">
                  {imageUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Upload</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                    disabled={imageUploading}
                  />
                </label>
              )}
            </div>

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
