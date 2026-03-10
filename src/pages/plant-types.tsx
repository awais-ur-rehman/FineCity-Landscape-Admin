import { useState } from 'react';
import { usePlantTypes, useCreatePlantType, useUpdatePlantType, useDeletePlantType } from '@/hooks/use-plant-types';
import type { PlantType } from '@/hooks/use-plant-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const plantTypeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  scientificName: z.string().optional(),
  description: z.string().optional(),
  careInstructions: z.string().optional(),
});

type PlantTypeFormValues = z.infer<typeof plantTypeSchema>;

export function PlantTypesPage() {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editType, setEditType] = useState<PlantType | null>(null);

  const { data: plantTypes, isLoading } = usePlantTypes();
  const createPlantType = useCreatePlantType();
  const updatePlantType = useUpdatePlantType();
  const deletePlantType = useDeletePlantType();

  const form = useForm<PlantTypeFormValues>({
    resolver: zodResolver(plantTypeSchema),
    defaultValues: {
      name: '',
      scientificName: '',
      description: '',
      careInstructions: '',
    },
  });

  const filteredTypes = plantTypes?.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.scientificName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (type: PlantType) => {
    setEditType(type);
    form.reset({
      name: type.name,
      scientificName: type.scientificName || '',
      description: type.description || '',
      careInstructions: type.careInstructions || '',
    });
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePlantType.mutateAsync(id);
      toast.success('Plant type deleted');
    } catch {
      toast.error('Failed to delete plant type');
    }
  };

  const onSubmit = async (values: PlantTypeFormValues) => {
    try {
      if (editType) {
        await updatePlantType.mutateAsync({ id: editType._id, data: values });
        toast.success('Plant type updated');
      } else {
        await createPlantType.mutateAsync(values);
        toast.success('Plant type created');
      }
      setFormOpen(false);
      setEditType(null);
      form.reset();
    } catch {
      toast.error('Failed to save plant type');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Plant Types</h1>
        <Button onClick={() => { setEditType(null); form.reset(); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />Add Plant Type
        </Button>
      </div>

      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search plant types..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Scientific Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Care Instructions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredTypes?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No plant types found
                </TableCell>
              </TableRow>
            ) : (
              filteredTypes?.map((type) => (
                <TableRow key={type._id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell className="italic text-muted-foreground">{type.scientificName || '—'}</TableCell>
                  <TableCell className="max-w-xs truncate">{type.description || '—'}</TableCell>
                  <TableCell className="max-w-xs truncate">{type.careInstructions || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={type.isActive ? 'default' : 'secondary'}>
                      {type.isActive ? 'Active' : 'Inactive'}
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
                        <DropdownMenuItem onClick={() => handleEdit(type)}>
                          <Pencil className="mr-2 h-4 w-4" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(type._id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editType ? 'Edit Plant Type' : 'Add Plant Type'}</DialogTitle>
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scientificName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scientific Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="careInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Care Instructions</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
