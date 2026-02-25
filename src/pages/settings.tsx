import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Admin Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{user?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-medium capitalize">{user?.role ?? '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Task Generator Cron</span>
            <code className="rounded bg-muted px-2 py-1 text-xs">0 * * * * (every hour)</code>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">App Version</span>
            <span className="text-sm font-medium">1.0.0-mvp</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Environment</span>
            <span className="text-sm font-medium">
              {import.meta.env.MODE}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
