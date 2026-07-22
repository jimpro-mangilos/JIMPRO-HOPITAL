import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import PatientsList from '@/pages/PatientsList';
import PatientDetail from '@/pages/PatientDetail';
import Appointments from '@/pages/Appointments';
import StaffList from '@/pages/StaffList';
import Consultations from '@/pages/Consultations';
import Pharmacy from '@/pages/Pharmacy';
import Laboratory from '@/pages/Laboratory';
import Imaging from '@/pages/Imaging';
import Hospitalization from '@/pages/Hospitalization';
import Emergency from '@/pages/Emergency';
import Billing from '@/pages/Billing';
import Reports from '@/pages/Reports';
import Users from '@/pages/Users';
import Settings from '@/pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/patients" element={<PatientsList />} />
                <Route path="/patients/:id" element={<PatientDetail />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/staff" element={<StaffList />} />
                <Route path="/consultations" element={<Consultations />} />
                <Route path="/pharmacy" element={<Pharmacy />} />
                <Route path="/laboratory" element={<Laboratory />} />
                <Route path="/imaging" element={<Imaging />} />
                <Route path="/hospitalization" element={<Hospitalization />} />
                <Route path="/emergency" element={<Emergency />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
