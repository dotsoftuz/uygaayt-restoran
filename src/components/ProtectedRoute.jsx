import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { DEV_MODE_BYPASS_AUTH } from '@/config/dev';
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Development mode'da darhol ruxsat berish
  if (DEV_MODE_BYPASS_AUTH) {
    return children;
  }

  // Token'ni darhol tekshirish - refresh'da tez ishlash uchun
  const token = localStorage.getItem('token');
  const hasToken = !!token;

  const [isChecking, setIsChecking] = useState(!hasToken); // Agar token bo'lsa, checking'ni false qilish
  const [isAuth, setIsAuth] = useState(hasToken); // Darhol token borligini belgilash

  useEffect(() => {
    // Token tekshiruvi
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const hasToken = !!token;

      setIsAuth(hasToken);
      setIsChecking(false);
    };

    // Agar token bo'lsa, darhol ruxsat berish
    if (hasToken) {
      setIsAuth(true);
      setIsChecking(false);
      return;
    }

    // Token yo'q bo'lsa, tekshirish
    checkAuth();

    // Storage o'zgarishlarini kuzatish (token o'chirilganda yoki qo'shilganda)
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        const token = localStorage.getItem('token');
        const hasToken = !!token;
        setIsAuth(hasToken);
      }
    };

    // Cross-tab storage o'zgarishlarini kuzatish
    window.addEventListener('storage', handleStorageChange);

    // LocalStorage o'zgarishlarini kuzatish uchun custom event
    // (API interceptor token'ni o'chirganda)
    const handleCustomStorageChange = () => {
      const token = localStorage.getItem('token');
      const hasToken = !!token;
      setIsAuth(hasToken);
    };

    // Custom event listener qo'shish
    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, []);

  // Path o'zgarganda token'ni qayta tekshirish
  // Faqat pathname o'zgarganda tekshirish, query parametrlar o'zgarganda emas
  useEffect(() => {
    // Path o'zgarganda, token hali ham mavjudligini tekshirish
    // Bu API interceptor token'ni o'chirgan bo'lsa, uni aniqlash uchun
    // Lekin faqat pathname o'zgarganda, query parametrlar o'zgarganda emas
    const token = localStorage.getItem('token');
    const hasToken = !!token;
    setIsAuth(hasToken);
  }, [location.pathname]);

  // Loading holatida
  if (isChecking) {
    return (
      <div className="bg-background h-screen w-full flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // Agar token yo'q bo'lsa, darhol signin'ga yo'naltirish
  if (!isAuth) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  // Token bor bo'lsa, children'ni ko'rsatish
  return children;
};

export default ProtectedRoute;
