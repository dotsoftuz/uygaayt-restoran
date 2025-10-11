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
import Orders from './Orders';
import Stores from './Stores';
import Products from './Products';
import Couriers from './Couriers';
import Users from './Users';
import Marketing from './Marketing';
import Analytics from './Analytics';
import Signin from './Signin';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';
import NotFound from './NotFound';

function Dashboard() {
  // yarn vite --host 127.0.0.1 --port 3000

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
          <Route path="orders" element={<Orders />} />
          <Route path="stores" element={<Stores />} />
          <Route path="products" element={<Products />} />
          <Route path="couriers" element={<Couriers />} />
          <Route path="users" element={<Users />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default Dashboard;
