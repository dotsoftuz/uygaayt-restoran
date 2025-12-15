import MainPage from '@/components/dashboard/MainPage';
import SettingsPage from '@/components/dashboard/settings/Settings';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthGuard from '@/components/AuthGuard';
import { DEV_MODE_BYPASS_AUTH } from '@/config/dev';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom';
import Orders from './Orders';
import OrderDetail from './OrderDetail';
import Products from './Products';
import ProductDetail from './ProductDetail';
import Catalog from './Catalog';
import Finance from './Finance';
import Promotions from './Promotions';
import PromotionDetail from './PromotionDetail';
import Reviews from './Reviews';
import ActivityLog from './ActivityLog';
import Help from './Help';
import Signin from './Signin';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';
import NotFound from './NotFound';
import { useEffect } from 'react';

// Root redirect komponenti - refresh berilgan URL'ni saqlab qoladi
const RootRedirect = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Development mode'da darhol dashboard'ga
  if (DEV_MODE_BYPASS_AUTH) {
    return <Navigate to="/dashboard" replace />;
  }

  // Token bo'lsa, dashboard'ga yo'naltirish
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // Token yo'q bo'lsa, signin'ga yo'naltirish
  return <Navigate to="/signin" replace state={{ from: location }} />;
};

function Dashboard() {
  // Refresh berilgan vaqtni saqlash - API interceptor'da 401 xatolarini boshqarish uchun
  // Bu refresh berilganda counter'ni tozalash uchun ishlatiladi
  useEffect(() => {
    // Refresh berilgan vaqtni saqlash
    sessionStorage.setItem('lastRefreshTime', Date.now().toString());
  }, []);

  return (
    <Router>
      <AuthGuard>
        <Routes>
          <Route
            path="/"
            element={<RootRedirect />}
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
            <Route path="promotion-detail/:id" element={<PromotionDetail />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="activity-log" element={<ActivityLog />} />
            <Route path="help" element={<Help />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthGuard>
    </Router>
  );
}

export default Dashboard;
