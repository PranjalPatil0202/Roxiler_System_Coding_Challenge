import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Common Components & Shell
import DashboardLayout from './components/common/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ToastContainer from './components/common/ToastContainer';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStores from './pages/admin/AdminStores';

// Normal User Pages
import UserStoresPage from './pages/normalUser/UserStoresPage';
import UserProfilePage from './pages/normalUser/UserProfilePage';

// Store Owner Pages
import OwnerDashboard from './pages/storeOwner/OwnerDashboard';
import OwnerSettings from './pages/storeOwner/OwnerSettings';

// 404
import NotFoundPage from './pages/NotFoundPage';

// Index Landing Resolver Component
const RootRedirect = () => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'store_owner') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/stores" replace />;
};

// Auth Page Gate (redirects away if already logged in)
const PublicAuthRoute = ({ children }) => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'store_owner') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/stores" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Index Route */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicAuthRoute>
            <LoginPage />
            <ToastContainer />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicAuthRoute>
            <SignupPage />
            <ToastContainer />
          </PublicAuthRoute>
        }
      />

      {/* Admin Protected Routes with Dashboard Layout */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AdminUsers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AdminStores />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Normal User Protected Routes with Dashboard Layout */}
      <Route
        path="/stores"
        element={
          <ProtectedRoute allowedRoles={['normal_user']}>
            <DashboardLayout>
              <UserStoresPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/profile"
        element={
          <ProtectedRoute allowedRoles={['normal_user']}>
            <DashboardLayout>
              <UserProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Store Owner Protected Routes with Dashboard Layout */}
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute allowedRoles={['store_owner']}>
            <DashboardLayout>
              <OwnerDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/settings"
        element={
          <ProtectedRoute allowedRoles={['store_owner']}>
            <DashboardLayout>
              <OwnerSettings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 Catch-All */}
      <Route
        path="*"
        element={
          <div className="app-wrapper">
            <main className="main-content">
              <NotFoundPage />
            </main>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
