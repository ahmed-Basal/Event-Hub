import { Navigate, Outlet, useLocation } from 'react-router';
import { useAccount } from '../../../features/account';
import Spinner from '../../../shared/components/feedback/Spinner';
import { PATHS } from '../paths';


export default function RequireAuth() {
  const { isLoggedIn, isLoading } = useAccount();
  const location = useLocation();

  if (isLoading) {
    return <Spinner message="Authenticating..." minHeight="60vh" />;
  }

  if (!isLoggedIn) {
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
