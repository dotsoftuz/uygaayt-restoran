import MainPage from '@/components/dashboard/MainPage';
import SettingsPage from '@/components/dashboard/settings/Settings';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { auth } from '@/firebase';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import NotFound from './NotFound';
import Signin from './Signin';
import Signup from './Signup';

function Dashboard() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={auth.currentUser ? '/dashboard' : '/signin'}
              replace
            />
          }
        />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MainPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default Dashboard;
