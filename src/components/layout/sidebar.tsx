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

function NavLink({
  to,
  label,
  icon: Icon,
  isActive,
  collapsed,
}: {
  to: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground',
        collapsed && 'justify-center px-2',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'branch_manager' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Collapse toggle — half-inside / half-outside, parallel to logo */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-8 -right-3 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-muted transition-colors"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft
          className={cn(
            'h-3.5 w-3.5 text-muted-foreground transition-transform duration-300',
            collapsed && 'rotate-180',
          )}
        />
      </button>

      {/* Logo */}
      <div className={cn('flex h-16 items-center px-4', collapsed ? 'justify-center' : 'gap-2')}>
        <Leaf className="h-5 w-5 shrink-0 text-sidebar-primary" />
        {!collapsed && (
          <span className="text-base font-semibold tracking-tight">Finecity Landscape</span>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Branch Selector */}
      <BranchSelector collapsed={collapsed} />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                label={label}
                icon={Icon}
                isActive={isActive}
                collapsed={collapsed}
              />
            );
          })}
        </div>

        <div className="mt-5">
          {!collapsed && (
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35">
              Master Data
            </p>
          )}
          {collapsed && <Separator className="my-2 bg-sidebar-border/50" />}
          <div className="space-y-0.5">
            {masterDataItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                label={label}
                icon={Icon}
                isActive={location.pathname.startsWith(to)}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="mt-5">
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35">
                Administration
              </p>
            )}
            {collapsed && <Separator className="my-2 bg-sidebar-border/50" />}
            <div className="space-y-0.5">
              {adminItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  label={label}
                  icon={Icon}
                  isActive={location.pathname.startsWith(to)}
                  collapsed={collapsed}
                />
              ))}
              {isSuperAdmin &&
                superAdminItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    label={label}
                    icon={Icon}
                    isActive={location.pathname.startsWith(to)}
                    collapsed={collapsed}
                  />
                ))}
            </div>
          </div>
        )}
      </nav>

      {/* Settings — pinned bottom */}
      <div className="border-t border-sidebar-border p-2">
        <NavLink
          to="/settings"
          label="Settings"
          icon={Settings}
          isActive={location.pathname.startsWith('/settings')}
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
}
