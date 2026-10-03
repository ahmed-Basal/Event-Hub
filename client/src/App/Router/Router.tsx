import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import App from '../Layout/App';
import Spinner from '../../shared/components/feedback/Spinner';

const HomePage = lazy(() => import('../../features/home/pages/HomePage'));
const ActivityDashboard = lazy(() => import('../../features/activities/pages/ActivityDashboard'));
const ActivityDetailsPage = lazy(() => import('../../features/activities/pages/ActivityDetailsPage'));
const ActivityForm = lazy(() => import('../../features/activities/pages/ActivityForm'));
const TestErrors = lazy(() => import('../../shared/components/errors/TestErrors'));
const NotFound = lazy(() => import('../../shared/components/errors/NotFound'));
const ServerError = lazy(() => import('../../shared/components/errors/ServerError'));

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
          <Suspense fallback={<Spinner message="Loading event studio..." minHeight="60vh" />}>
            <ActivityForm key="create" />
          </Suspense>
        ),
      },
      {
        path: 'manage/:id',
        element: (
          <Suspense fallback={<Spinner message="Loading event studio..." minHeight="60vh" />}>
            <ActivityForm />
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