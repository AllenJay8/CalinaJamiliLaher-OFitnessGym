import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const StaffRoute = () => {
  const { isAuthenticated, isAdmin, isStaff, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FACC15] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin && !isStaff) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default StaffRoute;
