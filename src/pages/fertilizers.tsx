import { useState } from 'react';
import { useFertilizers, useDeleteFertilizer } from '@/hooks/use-fertilizers';
import { useFertilizerUsageHistory } from '@/hooks/use-care-tasks';
import { type Fertilizer } from '@/lib/types';
import { useBranch } from '@/hooks/use-branch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { FertilizerForm } from '@/components/fertilizers/fertilizer-form';
import { format } from 'date-fns';

export function FertilizersPage() {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editFertilizer, setEditFertilizer] = useState<Fertilizer | null>(null);
  const { currentBranch } = useBranch();

  const { data: fertilizers, isLoading } = useFertilizers({ branchId: currentBranch?._id });
  const deleteFertilizer = useDeleteFertilizer();
  const { data: usageHistory, isLoading: usageLoading } = useFertilizerUsageHistory({
    branchId: currentBranch?._id,
    limit: 50,
  });

  const filteredFertilizers = fertilizers?.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.brand?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (fertilizer: Fertilizer) => {
    setEditFertilizer(fertilizer);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFertilizer.mutateAsync(id);
      toast.success('Fertilizer deleted');
    } catch {
      toast.error('Failed to delete fertilizer');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditFertilizer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Fertilizers</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Fertilizer
        </Button>
      </div>

      <Tabs defaultValue="catalog">
        <TabsList>
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="usage">Usage History</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="mt-4 space-y-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search fertilizers..."
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
                  <TableHead>Brand</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>NPK</TableHead>
                  <TableHead>Default Dose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : filteredFertilizers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No fertilizers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFertilizers?.map((fertilizer) => (
                    <TableRow key={fertilizer._id}>
                      <TableCell className="font-medium">{fertilizer.name}</TableCell>
                      <TableCell>{fertilizer.brand || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{fertilizer.type}</Badge>
                      </TableCell>
                      <TableCell>{fertilizer.npkRatio || '—'}</TableCell>
                      <TableCell>
                        {fertilizer.defaultDosage
                          ? `${fertilizer.defaultDosage} ${fertilizer.defaultUnit}`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={fertilizer.isActive ? 'default' : 'secondary'}>
                          {fertilizer.isActive ? 'Active' : 'Inactive'}
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
                            <DropdownMenuItem onClick={() => handleEdit(fertilizer)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(fertilizer._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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
        </TabsContent>

        <TabsContent value="usage" className="mt-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Completed By</TableHead>
                  <TableHead>Fertilizers Used</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : !usageHistory?.records.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No usage records found
                    </TableCell>
                  </TableRow>
                ) : (
                  usageHistory.records.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="text-sm">
                        {format(new Date(record.recordedAt), 'dd MMM yyyy, HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.batchId.name}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({record.batchId.zone})
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{record.completedBy.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {record.usages.map((u, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {u.fertilizerId.name} — {u.quantity} {u.unit}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.notes || '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <FertilizerForm open={formOpen} onClose={handleFormClose} fertilizer={editFertilizer} />
    </div>
  );
}
