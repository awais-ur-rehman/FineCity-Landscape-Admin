import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
} from '@tanstack/react-router';
import { TOKEN_KEYS, ROLES } from '@/lib/constants';
import type { AuthUser } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard';
import { PlantBatchesPage } from '@/pages/plant-batches';
import { PlantBatchDetailPage } from '@/pages/plant-batch-detail';
import { CareSchedulesPage } from '@/pages/care-schedules';
import { CareTasksPage } from '@/pages/care-tasks';
import { FertilizersPage } from '@/pages/fertilizers';
import { EmployeesPage } from '@/pages/employees';
import { SettingsPage } from '@/pages/settings';
import { CategoriesPage } from '@/pages/categories';
import { ZonesPage } from '@/pages/zones';
import { CareTypesPage } from '@/pages/care-types';
import { PlantTypesPage } from '@/pages/plant-types';
import { BranchesPage } from '@/pages/branches';
import { AuditLogsPage } from '@/pages/audit-logs';
import { ReportsPage } from '@/pages/reports';

function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEYS.ACCESS);
}

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEYS.USER);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function requireRole(...roles: Array<'super_admin' | 'admin' | 'employee'>) {
  const user = getStoredUser();
  if (!user || !roles.includes(user.role)) {
    throw redirect({ to: '/' });
  }
}

const rootRoute = createRootRoute();

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: () => {
    if (isAuthenticated()) throw redirect({ to: '/' });
  },
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AppLayout,
  beforeLoad: () => {
    if (!isAuthenticated()) throw redirect({ to: '/login' });
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: DashboardPage,
});

const plantBatchesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/plant-batches',
  component: PlantBatchesPage,
});

const plantBatchDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/plant-batches/$id',
  component: PlantBatchDetailPage,
});

const careSchedulesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/care-schedules',
  component: CareSchedulesPage,
});

const careTasksRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/care-tasks',
  component: CareTasksPage,
  validateSearch: (search: Record<string, unknown>) => ({
    status: typeof search.status === 'string' ? search.status : undefined,
  }),
});

const fertilizersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/fertilizers',
  component: FertilizersPage,
});

const employeesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/employees',
  component: EmployeesPage,
});

const usersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/users',
  component: EmployeesPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/settings',
  component: SettingsPage,
});

const categoriesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/categories',
  component: CategoriesPage,
});

const zonesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/zones',
  component: ZonesPage,
});

const careTypesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/care-types',
  component: CareTypesPage,
});

const plantTypesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/plant-types',
  component: PlantTypesPage,
});

/** Branches — super_admin only */
const branchesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/branches',
  component: BranchesPage,
  beforeLoad: () => requireRole(ROLES.SUPER_ADMIN),
});

/** Audit Logs — admin + super_admin only */
const auditLogsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/audit-logs',
  component: AuditLogsPage,
  beforeLoad: () => requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN),
});

/** Reports — admin + super_admin only */
const reportsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/reports',
  component: ReportsPage,
  beforeLoad: () => requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN),
});

/** Catch-all: unknown paths redirect to / (auth guard on authenticatedRoute handles the rest) */
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  beforeLoad: () => {
    throw redirect({ to: '/' });
  },
  component: () => null,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  notFoundRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    plantBatchesRoute,
    plantBatchDetailRoute,
    careSchedulesRoute,
    careTasksRoute,
    fertilizersRoute,
    employeesRoute,
    usersRoute,
    settingsRoute,
    categoriesRoute,
    zonesRoute,
    careTypesRoute,
    plantTypesRoute,
    branchesRoute,
    auditLogsRoute,
    reportsRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
