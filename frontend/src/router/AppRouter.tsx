import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';

// Auth Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Dashboard Pages
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import RegistrantDashboard from '../pages/dashboard/RegistrantDashboard';
import MyStatistics from '../pages/dashboard/MyStatistics';
import AdminStatistics from '../pages/dashboard/AdminStatistics';
import AddMember from '../pages/dashboard/AddMember';
import MyMembers from '../pages/dashboard/MyMembers';
import MemberDetails from '../pages/dashboard/MemberDetails';
import EditMember from '../pages/dashboard/EditMember';
import ProfileSettings from '../pages/dashboard/ProfileSettings';
import ExportData from '../pages/dashboard/ExportData';
import UserManagement from '../pages/dashboard/UserManagement';
import Settings from '../pages/dashboard/Settings';
import SearchMembers from '../pages/dashboard/SearchMembers';
import MemberSearchPage from '../pages/auth/MemberSearchPage';

// Components
import DashboardLayout from '../components/layout/DashboardLayout';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/registrant/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if already logged in)
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (isAuthenticated && user) {
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/registrant/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />
        
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        } />
        
        <Route path="/reset-password" element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        } />
        
        <Route path="/member-search" element={<MemberSearchPage />} />
        
        <Route path="/admin/search-members" element={<SearchMembers />} />
        
        {/* Redirects for backward compatibility */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/registrant" element={<Navigate to="/registrant/dashboard" replace />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/stats" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AdminStatistics />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/members" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <MyMembers />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/my-members" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <MyMembers />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/members/add" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AddMember />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/members/:id" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <MemberDetails />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/members/:id/edit" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <EditMember />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/export" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <ExportData />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <UserManagement />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/profile-settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <ProfileSettings />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Protected Registrant Routes */}
        <Route path="/registrant/dashboard" element={
          <ProtectedRoute allowedRoles={['registrant']}>
            <DashboardLayout>
              <RegistrantDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/registrant/stats" element={
          <ProtectedRoute allowedRoles={['registrant']}>
            <DashboardLayout>
              <MyStatistics />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/registrant/members" element={
          <ProtectedRoute allowedRoles={['registrant']}>
            <DashboardLayout>
              <MyMembers />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/registrant/members/add" element={
          <ProtectedRoute allowedRoles={['registrant']}>
            <DashboardLayout>
              <AddMember />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/registrant/members/:id" element={
          <ProtectedRoute allowedRoles={['registrant']}>
            <DashboardLayout>
              <MemberDetails />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/registrant/members/:id/edit" element={
          <ProtectedRoute allowedRoles={['registrant']}>
            <DashboardLayout>
              <EditMember />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/registrant/profile-settings" element={
          <ProtectedRoute allowedRoles={['registrant']}>
            <DashboardLayout>
              <ProfileSettings />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;