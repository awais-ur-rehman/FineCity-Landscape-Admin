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

function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEYS.ACCESS);
}

/** Root route — no UI, just an outlet */
const rootRoute = createRootRoute();

/** Login route — redirect to dashboard if already logged in */
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({ to: '/' });
    }
  },
});

/** Authenticated layout route — wraps all protected pages */
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AppLayout,
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

/** Dashboard */
const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: DashboardPage,
});

/** Plant Batches */
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

/** Placeholder pages */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-muted-foreground">Coming soon.</p>
    </div>
  );
}

const careSchedulesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/care-schedules',
  component: () => <PlaceholderPage title="Care Schedules" />,
});

const careTasksRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/care-tasks',
  component: () => <PlaceholderPage title="Care Tasks" />,
});

const employeesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/employees',
  component: () => <PlaceholderPage title="Employees" />,
});

const settingsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/settings',
  component: () => <PlaceholderPage title="Settings" />,
});

/** Build the route tree */
const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    plantBatchesRoute,
    plantBatchDetailRoute,
    careSchedulesRoute,
    careTasksRoute,
    employeesRoute,
    settingsRoute,
  ]),
]);

/** Create the router instance */
export const router = createRouter({ routeTree });

/** Type declaration for type-safe routing */
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
