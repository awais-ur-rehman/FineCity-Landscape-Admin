import { useState } from 'react';
import { useZones, useCreateZone, useUpdateZone, useDeleteZone } from '@/hooks/use-zones';
import type { Zone, ZoneCreatePayload } from '@/hooks/use-zones';
import { useBranch } from '@/hooks/use-branch';
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

const zoneSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
});

type ZoneFormValues = z.infer<typeof zoneSchema>;

export function ZonesPage() {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editZone, setEditZone] = useState<Zone | null>(null);

  const { currentBranch } = useBranch();
  const { data: zones, isLoading } = useZones({ branchId: currentBranch?._id });
  const createZone = useCreateZone();
  const updateZone = useUpdateZone();
  const deleteZone = useDeleteZone();

  const form = useForm<ZoneFormValues>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
    },
  });

  const filteredZones = zones?.filter((z) =>
    z.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (zone: Zone) => {
    setEditZone(zone);
    form.reset({
      name: zone.name,
      code: zone.code,
      description: zone.description || '',
    });
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteZone.mutateAsync(id);
      toast.success('Zone deleted');
    } catch {
      toast.error('Failed to delete zone');
    }
  };

  const onSubmit = async (values: ZoneFormValues) => {
    try {
      if (editZone) {
        await updateZone.mutateAsync({ id: editZone._id, data: values });
        toast.success('Zone updated');
      } else {
        if (!currentBranch) {
          toast.error('Select a branch before creating a zone');
          return;
        }
        await createZone.mutateAsync({ ...values, branchId: currentBranch._id } as ZoneCreatePayload);
        toast.success('Zone created');
      }
      setFormOpen(false);
      setEditZone(null);
      form.reset();
    } catch {
      toast.error('Failed to save zone');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Zones</h1>
        <Button onClick={() => { setEditZone(null); form.reset(); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />Add Zone
        </Button>
      </div>

      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search zones..."
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
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredZones?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No zones found
                </TableCell>
              </TableRow>
            ) : (
              filteredZones?.map((zone) => (
                <TableRow key={zone._id}>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell>{zone.code}</TableCell>
                  <TableCell>{zone.description || '—'}</TableCell>
                  <TableCell>{zone.branchId?.name}</TableCell>
                  <TableCell>
                    <Badge variant={zone.isActive ? 'default' : 'secondary'}>
                      {zone.isActive ? 'Active' : 'Inactive'}
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
                        <DropdownMenuItem onClick={() => handleEdit(zone)}>
                          <Pencil className="mr-2 h-4 w-4" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(zone._id)}
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
            <DialogTitle>{editZone ? 'Edit Zone' : 'Add Zone'}</DialogTitle>
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
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
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
