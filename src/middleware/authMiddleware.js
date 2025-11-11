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
      if (isPublicRoute && token) {
        navigate('/dashboard', { replace: true });
        return;
      }

      // Protected route'lar uchun ProtectedRoute komponenti ishlaydi, middleware bu yerda ishlamaydi
      // Bu middleware va ProtectedRoute o'rtasidagi conflict'ni oldini oladi
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
  window.location.href = '/signin';
};

