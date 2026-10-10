import { lazy } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import App from '../Layout/App';
import RequireAuth from './guards/RequireAuth';
import GuestRoute from './guards/GuestRoute';
import { PATHS } from './paths';

// Lazy-loaded Pages (Code Splitting)
const HomePage = lazy(() => import('../../features/home/pages/HomePage'));
const ActivityDashboard = lazy(() => import('../../features/activities/pages/ActivityDashboard'));
const ActivityDetailsPage = lazy(() => import('../../features/activities/pages/ActivityDetailsPage'));
const ActivityForm = lazy(() => import('../../features/activities/pages/ActivityForm'));
const LoginPage = lazy(() => import('../../features/account/pages/LoginPage'));
const RegisterPage = lazy(() => import('../../features/account/pages/RegisterPage'));
const TestErrors = lazy(() => import('../../pages/errors/TestErrors'));
const NotFound = lazy(() => import('../../pages/errors/NotFound'));
const ServerError = lazy(() => import('../../pages/errors/ServerError'));

// Public & Discovery Routes
const publicRoutes: RouteObject[] = [
  {
    path: '',
    element: <HomePage />,
  },
  {
    path: 'activities',
    element: <ActivityDashboard />,
  },
  {
    path: 'activities/:id',
    element: <ActivityDetailsPage />,
  },
  {
    path: 'activities/:id/:slug',
    element: <ActivityDetailsPage />,
  },
];

// Authentication Routes (Only accessible by Guests)
const authRoutes: RouteObject[] = [
  {
    element: <GuestRoute />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
];

// Protected Routes (Require Authentication)
const protectedRoutes: RouteObject[] = [
  {
    element: <RequireAuth />,
    children: [
      { path: 'createActivity', element: <ActivityForm key="create" /> },
      { path: 'manage/:id', element: <ActivityForm /> },
    ],
  },
];

// Diagnostics & System Error Routes
const systemRoutes: RouteObject[] = [
  { path: 'errors', element: <TestErrors /> },
  { path: 'not-found', element: <NotFound /> },
  { path: 'server-error', element: <ServerError /> },
  { path: '*', element: <Navigate replace to={PATHS.NOT_FOUND} /> },
];

/**
 * Root Application Router
 */
export const router = createBrowserRouter([
  {
    path: PATHS.HOME,
    element: <App />,
    errorElement: <ServerError />,
    children: [
      ...publicRoutes,
      ...authRoutes,
      ...protectedRoutes,
      ...systemRoutes,
    ],
  },
]);

export default router;