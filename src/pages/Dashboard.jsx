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
import Clients from './Clients';
import ClientDetails from './ClientDetails';
import CreateOrder from './CreateOrder';
import CreateTemplate from './CreateTemplate';
import EditOrder from './EditOrder';
import EmployeeDetails from './EmployeeDetails';
import Employees from './Employees';
import ForgotPassword from './ForgotPassword';
import NotFound from './NotFound';
import OrderDetail from './OrderDetail';
import OrderTemplate from './OrderTemplate';
import Orders from './Orders';
import Services from './Services';
import Signin from './Signin';
import Signup from './Signup';
import TemplateDetail from './TemplateDetail';

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
          <Route path="create-order" element={<CreateOrder />} />
          <Route path="orders" element={<Orders />} />
          <Route path="order-detail/:orderId" element={<OrderDetail />} />
          <Route path="edit-order/:orderId" element={<EditOrder />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:clientId" element={<ClientDetails />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/:employeeId" element={<EmployeeDetails />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="services" element={<Services />} />
          <Route path="order-template" element={<OrderTemplate />} />
          <Route path="template-detail/:id" element={<TemplateDetail />} />
          <Route path="create-template" element={<CreateTemplate />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default Dashboard;
