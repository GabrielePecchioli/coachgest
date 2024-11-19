import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/auth/Login';
import AdminLogin from '../pages/auth/AdminLogin';
import Register from '../pages/auth/Register';
import SuperAdminDashboard from '../pages/dashboard/SuperAdminDashboard';
import CoachDashboard from '../pages/dashboard/CoachDashboard';
import CoacheeDashboard from '../pages/dashboard/CoacheeDashboard';
import TeamManagement from '../pages/coach/TeamManagement';
import CoacheeManagement from '../pages/coach/CoacheeManagement';
import Profile from '../pages/coach/Profile';
import Billing from '../pages/coach/Profile/Billing';
import Subscription from '../pages/coach/Subscription';
import Transactions from '../pages/coach/Subscription/Transactions';
import SubscriptionSettings from '../pages/admin/SubscriptionSettings';
import StripeSettings from '../pages/admin/StripeSettings';
import StripeCallback from '../pages/admin/StripeSettings/Callback';
import CoachManagement from '../pages/admin/CoachManagement';
import CoachDetails from '../pages/admin/CoachManagement/CoachDetails';

function PrivateRoute({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) {
  const { currentUser, loading } = useAuth();

  if (loading) return null;

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/register" element={<Register />} />
      
      {/* Super Admin Routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/coaches"
        element={
          <PrivateRoute allowedRoles={['super_admin']}>
            <CoachManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/coaches/:id"
        element={
          <PrivateRoute allowedRoles={['super_admin']}>
            <CoachDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/settings/subscriptions"
        element={
          <PrivateRoute allowedRoles={['super_admin']}>
            <SubscriptionSettings />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/settings/stripe"
        element={
          <PrivateRoute allowedRoles={['super_admin']}>
            <StripeSettings />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/settings/stripe/callback"
        element={
          <PrivateRoute allowedRoles={['super_admin']}>
            <StripeCallback />
          </PrivateRoute>
        }
      />
      
      {/* Coach Routes */}
      <Route
        path="/coach"
        element={
          <PrivateRoute allowedRoles={['coach']}>
            <CoachDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/coach/team"
        element={
          <PrivateRoute allowedRoles={['coach']}>
            <TeamManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/coach/coachees"
        element={
          <PrivateRoute allowedRoles={['coach']}>
            <CoacheeManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/coach/profile"
        element={
          <PrivateRoute allowedRoles={['coach']}>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/coach/profile/billing"
        element={
          <PrivateRoute allowedRoles={['coach']}>
            <Billing />
          </PrivateRoute>
        }
      />
      <Route
        path="/coach/subscription"
        element={
          <PrivateRoute allowedRoles={['coach']}>
            <Subscription />
          </PrivateRoute>
        }
      />
      <Route
        path="/coach/subscription/transactions"
        element={
          <PrivateRoute allowedRoles={['coach']}>
            <Transactions />
          </PrivateRoute>
        }
      />
      
      {/* Coachee Routes */}
      <Route
        path="/coachee"
        element={
          <PrivateRoute allowedRoles={['coachee']}>
            <CoacheeDashboard />
          </PrivateRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}