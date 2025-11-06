import MainPage from '@/components/dashboard/MainPage';
import SettingsPage from '@/components/dashboard/settings/Settings';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { auth } from '@/firebase';
import { DEV_MODE_BYPASS_AUTH } from '@/config/dev';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import Orders from './Orders';
import OrderDetail from './OrderDetail';
import Stores from './Stores';
import Products from './Products';
import ProductDetail from './ProductDetail';
import Couriers from './Couriers';
import Users from './Users';
import Marketing from './Marketing';
import Analytics from './Analytics';
import Catalog from './Catalog';
import Finance from './Finance';
import Promotions from './Promotions';
import Reviews from './Reviews';
import ActivityLog from './ActivityLog';
import Help from './Help';
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
              to={
                DEV_MODE_BYPASS_AUTH
                  ? '/dashboard'
                  : auth.currentUser
                    ? '/dashboard'
                    : '/signin'
              }
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
          <Route path="order-detail/:orderId" element={<OrderDetail />} />
          <Route path="products" element={<Products />} />
          <Route path="product-detail/:productId" element={<ProductDetail />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="finance" element={<Finance />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="activity-log" element={<ActivityLog />} />
          <Route path="help" element={<Help />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default Dashboard;
