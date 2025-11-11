import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { DEV_MODE_BYPASS_AUTH } from '@/config/dev';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Development mode'da darhol ruxsat berish
  if (DEV_MODE_BYPASS_AUTH) {
    return children;
  }

  // Darhol token tekshiruvi - loading holatini minimallashtirish
  const token = localStorage.getItem('token');
  const isAuth = !!token;

  // Agar token yo'q bo'lsa, darhol signin'ga yo'naltirish
  if (!isAuth) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  // Token bor bo'lsa, children'ni ko'rsatish
  return children;
};

export default ProtectedRoute;
