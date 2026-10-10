import { Navigate, Outlet, useLocation } from 'react-router';
import { useAccount } from '../../../features/account';
import Spinner from '../../../shared/components/feedback/Spinner';
import { PATHS } from '../paths';


export default function GuestRoute() {
  const { isLoggedIn, isLoading } = useAccount();
  const location = useLocation();

  if (isLoading) {
    return <Spinner message="Checking authentication..." minHeight="60vh" />;
  }

  if (isLoggedIn) {
    const from = (location.state as any)?.from?.pathname || PATHS.ACTIVITIES;
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
