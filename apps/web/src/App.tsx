import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClassSchedulePage from './pages/ClassSchedulePage';
import MemberPortalPage from './pages/MemberPortalPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TrainerPortalPage from './pages/TrainerPortalPage';

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes"
        element={
          <ProtectedRoute>
            <ClassSchedulePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member"
        element={
          <ProtectedRoute>
            <MemberPortalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainer"
        element={
          <ProtectedRoute roles={['trainer']}>
            <TrainerPortalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['gym_manager', 'super_admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
