import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-white">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FACC15] border-t-transparent" />
  </div>
);

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: 'protected' }} />;

  return <Outlet />;
};

export default ProtectedRoute;
