import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
} from '@tanstack/react-router';
import { TOKEN_KEYS } from '@/lib/constants';
import { AppLayout } from '@/components/layout/app-layout';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard';
import { PlantBatchesPage } from '@/pages/plant-batches';
import { PlantBatchDetailPage } from '@/pages/plant-batch-detail';
import { CareSchedulesPage } from '@/pages/care-schedules';
import { CareTasksPage } from '@/pages/care-tasks';
import { EmployeesPage } from '@/pages/employees';
import { SettingsPage } from '@/pages/settings';
import { CategoriesPage } from '@/pages/categories';
import { ZonesPage } from '@/pages/zones';
import { CareTypesPage } from '@/pages/care-types';
import { PlantTypesPage } from '@/pages/plant-types';
import { BranchesPage } from '@/pages/branches';
import { AuditLogsPage } from '@/pages/audit-logs';

function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEYS.ACCESS);
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
});

const employeesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/employees', // Keep /employees for now, but link to /users in sidebar if needed, or map both
  component: EmployeesPage,
});

// Map /users to EmployeesPage for now as they are essentially the same
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

const branchesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/branches',
  component: BranchesPage,
});

const auditLogsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/audit-logs',
  component: AuditLogsPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    plantBatchesRoute,
    plantBatchDetailRoute,
    careSchedulesRoute,
    careTasksRoute,
    employeesRoute,
    usersRoute,
    settingsRoute,
    categoriesRoute,
    zonesRoute,
    careTypesRoute,
    plantTypesRoute,
    branchesRoute,
    auditLogsRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
