import { useState } from 'react';
import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch } from '@/hooks/use-branches';
import type { Branch } from '@/hooks/use-branches';
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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const branchSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(1, 'Code is required'),
  location: z.string().min(1, 'Location is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactEmail: z.string().email('Enter a valid email'),
  contactPhone: z.string().optional(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

export function BranchesPage() {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);

  const { data: branches, isLoading } = useBranches();
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useDeleteBranch();

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      code: '',
      location: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
    },
  });

  const filteredBranches = branches?.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (branch: Branch) => {
    setEditBranch(branch);
    form.reset({
      name: branch.name,
      code: branch.code,
      location: branch.location,
      contactPerson: branch.contactPerson || '',
      contactEmail: branch.contactEmail || '',
      contactPhone: branch.contactPhone || '',
    });
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBranch.mutateAsync(id);
      toast.success('Branch deleted');
    } catch {
      toast.error('Failed to delete branch');
    }
  };

  const onSubmit = async (values: BranchFormValues) => {
    try {
      if (editBranch) {
        await updateBranch.mutateAsync({ id: editBranch._id, data: values });
        toast.success('Branch updated');
      } else {
        await createBranch.mutateAsync(values);
        toast.success('Branch created');
      }
      setFormOpen(false);
      setEditBranch(null);
      form.reset();
    } catch {
      toast.error('Failed to save branch');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Branches</h1>
        <Button onClick={() => { setEditBranch(null); form.reset(); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />Add Branch
        </Button>
      </div>

      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search branches..."
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
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredBranches?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No branches found
                </TableCell>
              </TableRow>
            ) : (
              filteredBranches?.map((branch) => (
                <TableRow key={branch._id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {branch.name}
                  </TableCell>
                  <TableCell>{branch.code}</TableCell>
                  <TableCell>{branch.location}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="font-medium">{branch.contactPerson}</span>
                      <span className="text-muted-foreground">{branch.contactEmail}</span>
                      {branch.contactPhone && <span className="text-muted-foreground">{branch.contactPhone}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                      {branch.isActive ? 'Active' : 'Inactive'}
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
                        <DropdownMenuItem onClick={() => handleEdit(branch)}>
                          <Pencil className="mr-2 h-4 w-4" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(branch._id)}
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
            <DialogTitle>{editBranch ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Downtown Branch" {...field} />
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
                        <Input placeholder="DT-01" {...field} />
                      </FormControl>
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
                      <Input placeholder="123 Main St, City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="branch@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+971 50 000 0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
