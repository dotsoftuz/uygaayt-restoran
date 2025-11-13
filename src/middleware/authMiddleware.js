import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DEV_MODE_BYPASS_AUTH } from '@/config/dev';

/**
 * Auth Middleware Hook
 * Barcha protected route'lar uchun authentication tekshiruvi
 */
export const useAuthMiddleware = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Development mode'da middleware'ni o'tkazib yuborish
    if (DEV_MODE_BYPASS_AUTH) {
      return;
    }

    // Kichik kechikish - localStorage o'zgarishlarini kutish uchun
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const isPublicRoute = ['/signin', '/signup', '/forgot-password'].includes(location.pathname);
      const isProtectedRoute = location.pathname.startsWith('/dashboard') || location.pathname === '/';

      // Protected route'lar uchun ProtectedRoute komponenti ishlaydi, shuning uchun middleware faqat public route'lar uchun ishlaydi
      // Faqat public route'ga kirishga harakat qilayotgan bo'lsa va token bo'lsa, dashboard'ga yo'naltirish
      // Lekin refresh berilgan URL protected route bo'lsa, o'sha URL'da qolish kerak
      if (isPublicRoute && token) {
        // Agar location.state.from bo'lsa (masalan, protected route'dan kelgan bo'lsa), o'sha URL'ga yo'naltirish
        const from = location.state?.from?.pathname;
        const redirectTo = from && from.startsWith('/dashboard') ? from : '/dashboard';
        navigate(redirectTo, { replace: true });
        return;
      }

      // Protected route'lar uchun ProtectedRoute komponenti ishlaydi, middleware bu yerda ishlamaydi
      // Bu middleware va ProtectedRoute o'rtasidagi conflict'ni oldini oladi
      // Refresh berilganda, agar token bo'lsa, ProtectedRoute o'sha URL'da qoladi
    };

    // Kichik kechikish - login qilgandan keyin token saqlanishini kutish uchun
    const timeoutId = setTimeout(checkAuth, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, navigate]);
};

/**
 * Token tekshiruvi
 * @returns {boolean} - Token mavjudligi
 */
export const isAuthenticated = () => {
  if (DEV_MODE_BYPASS_AUTH) {
    return true;
  }
  return !!localStorage.getItem('token');
};

/**
 * Token olish
 * @returns {string|null} - Token yoki null
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Logout qilish
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('storeId');
  localStorage.removeItem('storeData');
  localStorage.removeItem('lastLoginTime');
  window.location.href = '/signin';
};

