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

    const token = localStorage.getItem('token');
    const isPublicRoute = ['/signin', '/signup', '/forgot-password'].includes(location.pathname);
    const isProtectedRoute = location.pathname.startsWith('/dashboard') || location.pathname === '/';

    // Agar protected route'ga kirishga harakat qilayotgan bo'lsa va token yo'q bo'lsa
    if (isProtectedRoute && !token) {
      // Navigate'ni setTimeout bilan chaqirish - React Router'ning render sikli tugagandan keyin
      setTimeout(() => {
        navigate('/signin', { replace: true });
      }, 0);
      return;
    }

    // Agar public route'ga kirishga harakat qilayotgan bo'lsa va token bo'lsa
    if (isPublicRoute && token) {
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 0);
      return;
    }
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

