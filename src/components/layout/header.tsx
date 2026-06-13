import { useAuth } from '@/hooks/use-auth';
import { useLocation } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/plant-batches': 'Plant Batches',
  '/care-schedules': 'Care Schedules',
  '/care-tasks': 'Care Tasks',
  '/fertilizers': 'Fertilizers',
  '/zones': 'Zones',
  '/categories': 'Categories',
  '/care-types': 'Care Types',
  '/plant-types': 'Plant Types',
  '/users': 'Users',
  '/reports': 'Reports',
  '/audit-logs': 'Audit Logs',
  '/branches': 'Branches',
  '/settings': 'Settings',
};

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  const match = Object.entries(PAGE_TITLES).find(
    ([path]) => path !== '/' && pathname.startsWith(path),
  );
  return match?.[1] ?? '';
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {initials}
    </div>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
      <p className="text-sm font-medium text-foreground">{pageTitle}</p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 px-2 hover:bg-muted">
            <UserAvatar name={user?.name ?? 'Admin'} />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-medium leading-tight">{user?.name ?? 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground capitalize leading-tight">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="px-3 py-2">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
