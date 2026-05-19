import { BranchSelector } from './branch-selector';
import { useAuth } from '@/hooks/use-auth';
import { Link, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Leaf,
  CalendarClock,
  ClipboardList,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  MapPin,
  Droplets,
  TreePine,
  Building2,
  FileText,
  BarChart2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/plant-batches', label: 'Plant Batches', icon: Leaf },
  { to: '/care-schedules', label: 'Care Schedules', icon: CalendarClock },
  { to: '/care-tasks', label: 'Care Tasks', icon: ClipboardList },
  { to: '/fertilizers', label: 'Fertilizers', icon: Droplets },
];

const masterDataItems = [
  { to: '/categories', label: 'Categories', icon: FolderTree },
  { to: '/zones', label: 'Zones', icon: MapPin },
  { to: '/care-types', label: 'Care Types', icon: Droplets },
  { to: '/plant-types', label: 'Plant Types', icon: TreePine },
];

const adminItems = [
  { to: '/users', label: 'Users', icon: Users },
  { to: '/reports', label: 'Reports', icon: BarChart2 },
  { to: '/audit-logs', label: 'Audit Logs', icon: FileText },
];

const superAdminItems = [
  { to: '/branches', label: 'Branches', icon: Building2 },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <aside
      className={cn(
        'flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center px-4">
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight">
            Finecity Landscape
          </span>
        )}
        {collapsed && (
          <Leaf className="h-6 w-6 text-sidebar-primary" />
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Branch Selector */}
      <BranchSelector collapsed={collapsed} />

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);

          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                collapsed && 'justify-center px-2',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {!collapsed && (
          <div className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Master Data
          </div>
        )}
        
        {masterDataItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              location.pathname.startsWith(to)
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
              collapsed && 'justify-center px-2',
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        {isAdmin && (
          <>
            {!collapsed && (
              <div className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                Administration
              </div>
            )}
            {adminItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  location.pathname.startsWith(to)
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                  collapsed && 'justify-center px-2',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            ))}
            {isSuperAdmin && superAdminItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  location.pathname.startsWith(to)
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                  collapsed && 'justify-center px-2',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Settings (Pinned Bottom) */}
      <div className="p-2 border-t border-sidebar-border">
        <Link
          to="/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            location.pathname.startsWith('/settings')
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
            collapsed && 'justify-center px-2',
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        
        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="mt-2 w-full text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
