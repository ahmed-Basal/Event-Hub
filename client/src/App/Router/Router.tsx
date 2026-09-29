import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import App from '../Layout/App';
import { Spinner } from '../../shared';

// Code Splitting / Lazy Loading (Phase 7 Optimization)
// Significantly reduces initial bundle size by loading pages on-demand
const HomePage = lazy(() => import('../../features/home/HomePage'));
const ActivityDashboard = lazy(() => import('../../features/activities/pages/ActivityDashboard'));
const ActivityForm = lazy(() => import('../../features/activities/pages/ActivityForm'));
const ActivityDetailsPage = lazy(() => import('../../features/activities/pages/ActivityDetailsPage'));
const TestErrors = lazy(() => import('../../features/errors/TestErrors'));
const NotFound = lazy(() => import('../../features/errors/NotFound'));
const ServerError = lazy(() => import('../../features/errors/ServerError'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: (
      <Suspense fallback={<Spinner message="Loading..." minHeight="60vh" />}>
        <ServerError />
      </Suspense>
    ),
    children: [
      {
        path: '',
        element: (
          <Suspense fallback={<Spinner message="Loading Egypt Tech Events..." minHeight="60vh" />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'activities',
        element: (
          <Suspense fallback={<Spinner message="Loading meetups..." minHeight="60vh" />}>
            <ActivityDashboard />
          </Suspense>
        ),
      },
      {
        path: 'activities/:id',
        element: (
          <Suspense fallback={<Spinner message="Loading event details..." minHeight="60vh" />}>
            <ActivityDetailsPage />
          </Suspense>
        ),
      },
      {
        path: 'activities/:id/:slug',
        element: (
          <Suspense fallback={<Spinner message="Loading event details..." minHeight="60vh" />}>
            <ActivityDetailsPage />
          </Suspense>
        ),
      },
      {
        path: 'createActivity',
        element: (
          <Suspense fallback={<Spinner message="Preparing form..." minHeight="60vh" />}>
            <ActivityForm key="createActivity" />
          </Suspense>
        ),
      },
      {
        path: 'manage/:id',
        element: (
          <Suspense fallback={<Spinner message="Loading event editor..." minHeight="60vh" />}>
            <ActivityForm key="manage" />
          </Suspense>
        ),
      },
      {
        path: 'errors',
        element: (
          <Suspense fallback={<Spinner message="Loading..." minHeight="60vh" />}>
            <TestErrors />
          </Suspense>
        ),
      },
      {
        path: 'not-found',
        element: (
          <Suspense fallback={<Spinner message="Loading..." minHeight="60vh" />}>
            <NotFound />
          </Suspense>
        ),
      },
      {
        path: 'server-error',
        element: (
          <Suspense fallback={<Spinner message="Loading..." minHeight="60vh" />}>
            <ServerError />
          </Suspense>
        ),
      },
      { path: '*', element: <Navigate replace to="/not-found" /> },
    ],
  },
]);