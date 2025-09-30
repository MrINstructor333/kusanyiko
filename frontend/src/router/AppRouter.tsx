import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';

// Auth Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
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
        
        <Route path="/signup" element={
          <PublicRoute>
            <SignupPage />
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
        
        {/* Protected Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="stats" element={<AdminStatistics />} />
                <Route path="members" element={<MyMembers />} />
                <Route path="my-members" element={<MyMembers />} />
                <Route path="members/add" element={<AddMember />} />
                <Route path="members/:id" element={<MemberDetails />} />
                <Route path="members/:id/edit" element={<EditMember />} />
                <Route path="export" element={<ExportData />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile-settings" element={<ProfileSettings />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Protected Registrant Routes */}
        <Route path="/registrant/*" element={
          <ProtectedRoute allowedRoles={['registrant']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<RegistrantDashboard />} />
                <Route path="stats" element={<MyStatistics />} />
                <Route path="members" element={<MyMembers />} />
                <Route path="members/add" element={<AddMember />} />
                <Route path="members/:id" element={<MemberDetails />} />
                <Route path="members/:id/edit" element={<EditMember />} />
                <Route path="profile-settings" element={<ProfileSettings />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
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