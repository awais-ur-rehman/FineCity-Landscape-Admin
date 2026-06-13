import { Outlet, Link, useLocation } from '@tanstack/react-router';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useAuth } from '@/hooks/use-auth';
import { useBranches } from '@/hooks/use-branches';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

function NoBranchesScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-primary/10 p-4">
        <Building2 className="h-10 w-10 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">No branches yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first branch to start managing plant care operations.
        </p>
      </div>
      <Link to="/branches">
        <Button>Create Branch</Button>
      </Link>
    </div>
  );
}

export function AppLayout() {
  const { user } = useAuth();
  const { data: branches, isLoading } = useBranches();

  const location = useLocation();
  const isSuperAdmin = user?.role === 'super_admin';
  // Don't block the /branches page itself — that's where they create their first branch
  const hasNoBranches =
    isSuperAdmin &&
    !isLoading &&
    (!branches || branches.length === 0) &&
    location.pathname !== '/branches';

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {hasNoBranches ? <NoBranchesScreen /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}
