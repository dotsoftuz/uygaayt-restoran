import { useAuthMiddleware } from '@/middleware/authMiddleware';

/**
 * Auth Guard Component
 * Router ichida ishlatiladi va barcha route o'zgarishlarini kuzatadi
 */
const AuthGuard = ({ children }) => {
  useAuthMiddleware();
  return children;
};

export default AuthGuard;

