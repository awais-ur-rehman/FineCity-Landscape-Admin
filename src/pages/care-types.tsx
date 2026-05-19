import { useCareTypes } from '@/hooks/use-care-types';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { careTypeColor } from '@/lib/utils';

export function CareTypesPage() {
  const { data: careTypes } = useCareTypes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Care Types</h1>
          <p className="text-sm text-muted-foreground mt-1">
            System-defined care types. These are fixed enums managed in the backend.
          </p>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {careTypes?.map((type) => (
              <TableRow key={type._id}>
                <TableCell>
                  <Badge className={careTypeColor(type._id)}>
                    {type._id}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{type.name}</TableCell>
                <TableCell>
                  <Badge variant="default">Active</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
