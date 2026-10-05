import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import App from '../Layout/App';
import RequireAuth from './RequireAuth';

const HomePage = lazy(() => import('../../features/home/pages/HomePage'));
const ActivityDashboard = lazy(() => import('../../features/activities/pages/ActivityDashboard'));
const ActivityDetailsPage = lazy(() => import('../../features/activities/pages/ActivityDetailsPage'));
const ActivityForm = lazy(() => import('../../features/activities/pages/ActivityForm'));
const TestErrors = lazy(() => import('../../shared/components/errors/TestErrors'));
const NotFound = lazy(() => import('../../shared/components/errors/NotFound'));
const ServerError = lazy(() => import('../../shared/components/errors/ServerError'));
const LoginPage = lazy(() => import('../../features/account/pages/LoginPage'));
const RegisterPage = lazy(() => import('../../features/account/pages/RegisterPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ServerError />,
    children: [
      // Public landing & events
      { path: '', element: <HomePage /> },
      { path: 'activities', element: <ActivityDashboard /> },
      { path: 'activities/:id', element: <ActivityDetailsPage /> },
      { path: 'activities/:id/:slug', element: <ActivityDetailsPage /> },

      // Authentication routes
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },

      // Protected routes (require login)
      {
        element: <RequireAuth />,
        children: [
          { path: 'createActivity', element: <ActivityForm key="create" /> },
          { path: 'manage/:id', element: <ActivityForm /> },
        ],
      },

      // Diagnostics & Error pages
      { path: 'errors', element: <TestErrors /> },
      { path: 'not-found', element: <NotFound /> },
      { path: 'server-error', element: <ServerError /> },
      { path: '*', element: <Navigate replace to="/not-found" /> },
    ],
  },
]);