import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import StaffRoute from './components/StaffRoute';
import AppLayout from './layout/AppLayout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import MembersPage from './pages/Members/MembersPage';
import MemberProfilePage from './pages/Members/MemberProfilePage';
import MembershipPlansPage from './pages/MembershipPlans/MembershipPlansPage';
import AttendancePage from './pages/Attendance/AttendancePage';
import PaymentsPage from './pages/Payments/PaymentsPage';
import ReportsPage from './pages/Reports/ReportsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import WebhooksPage from './pages/Webhooks/WebhooksPage';

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FACC15] border-t-transparent" />
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route element={<StaffRoute />}>
            <Route path="/members" element={<MembersPage />} />
            <Route path="/members/:id" element={<MemberProfilePage />} />
            <Route path="/membership-plans" element={<MembershipPlansPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/webhooks" element={<WebhooksPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
