import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSidebarStore } from '@/store/sidebarStore';

export default function ProtectedRoute() {
  const { isAuthenticated, initialize } = useAuthStore();
  const { initialize: initSidebar } = useSidebarStore();
  const location = useLocation();

  useEffect(() => {
    initialize();
    initSidebar();
  }, [initialize, initSidebar]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
