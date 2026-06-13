import { useParams, useNavigate } from '@tanstack/react-router';
import { usePlantBatch } from '@/hooks/use-plant-batches';
import { useCareSchedules } from '@/hooks/use-care-schedules';
import { useCareTasks } from '@/hooks/use-care-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Plus } from 'lucide-react';
import { capitalize, careTypeColor, statusColor, formatDateShort, formatDate } from '@/lib/utils';

export function PlantBatchDetailPage() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();

  const batch = usePlantBatch(id!);
  const schedules = useCareSchedules({ batchId: id });
  const tasks = useCareTasks({ batchId: id, limit: 10 });

  if (batch.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!batch.data) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Batch not found</p>
        <Button variant="link" onClick={() => navigate({ to: '/plant-batches' })}>
          Back to Plant Batches
        </Button>
      </div>
    );
  }

  const b = batch.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/plant-batches' })}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">{b.name}</h1>
        <Badge variant={b.status === 'active' ? 'default' : 'outline'}>
          {capitalize(b.status)}
        </Badge>
      </div>

      {/* Batch info card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem label="Plant Type" value={typeof b.plantType === 'object' ? b.plantType.name : b.plantType} />
            {b.scientificName && <InfoItem label="Scientific Name" value={b.scientificName} />}
            <InfoItem label="Category" value={typeof b.category === 'object' ? b.category.name : capitalize(b.category)} />
            <InfoItem label="Quantity" value={String(b.quantity)} />
            <InfoItem label="Zone" value={b.zone ? (typeof b.zone === 'object' ? (b.zone as { name?: string }).name ?? '—' : String(b.zone)) : '—'} />
            <InfoItem label="Location" value={b.location} />
            <InfoItem label="Created" value={formatDateShort(b.createdAt)} />
            {b.createdBy && <InfoItem label="Created By" value={b.createdBy.name} />}
          </div>
          {b.notes && (
            <div className="mt-4 rounded-lg bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">{b.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Linked Care Schedules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Care Schedules</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: '/care-schedules' })}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Schedule
          </Button>
        </CardHeader>
        <CardContent>
          {schedules.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !schedules.data?.schedules.length ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No care schedules for this batch
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Care Type</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.data.schedules.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell>
                      <Badge className={careTypeColor(s.careType)}>
                        {capitalize(s.careType)}
                      </Badge>
                    </TableCell>
                    <TableCell>Every {s.frequencyDays} days</TableCell>
                    <TableCell>{s.scheduledTime}</TableCell>
                    <TableCell>
                      {s.assignedTo.length > 0
                        ? s.assignedTo.map((u) => u.name).join(', ')
                        : 'All employees'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.isActive ? 'default' : 'outline'}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !tasks.data?.tasks.length ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No tasks for this batch yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Care Type</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.data.tasks.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell>
                      <Badge className={careTypeColor(t.careType)}>
                        {capitalize(t.careType)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(t.scheduledAt)}</TableCell>
                    <TableCell>
                      <Badge className={statusColor(t.status)}>
                        {capitalize(t.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.completedBy?.name ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
