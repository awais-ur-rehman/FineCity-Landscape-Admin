import { useState } from 'react';
import { usePlantBatches, useDeleteBatch } from '@/hooks/use-plant-batches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BatchTable } from '@/components/plant-batches/batch-table';
import { BatchForm } from '@/components/plant-batches/batch-form';
import { PLANT_CATEGORIES, ZONES } from '@/lib/constants';
import { capitalize } from '@/lib/utils';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { PlantBatch } from '@/lib/types';

export function PlantBatchesPage() {
  const [search, setSearch] = useState('');
  const [zone, setZone] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('active');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editBatch, setEditBatch] = useState<PlantBatch | null>(null);

  const params = {
    ...(search && { search }),
    ...(zone && { zone }),
    ...(category && { category }),
    ...(status && { status }),
    page,
    limit: 20,
  };

  const { data, isLoading } = usePlantBatches(params);
  const deleteBatch = useDeleteBatch();

  const handleEdit = (batch: PlantBatch) => {
    setEditBatch(batch);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBatch.mutateAsync(id);
      toast.success('Plant batch deleted');
    } catch {
      toast.error('Failed to delete batch');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditBatch(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Plant Batches</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Batch
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search batches..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={zone}
          onValueChange={(v) => {
            setZone(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Zone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Zones</SelectItem>
            {ZONES.map((z) => (
              <SelectItem key={z} value={z}>
                Zone {z}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {PLANT_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {capitalize(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <BatchTable
        batches={data?.batches ?? []}
        pagination={data?.pagination}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <BatchForm
        open={formOpen}
        onClose={handleFormClose}
        batch={editBatch}
      />
    </div>
  );
}
