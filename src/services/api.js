import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003/v1',
});

// Handle all configuration of request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    const language = localStorage.getItem('i18nextLng') || 'uz';
    config.headers['Accept-Language'] = language;
    
    // Refresh berilgan vaqtni tekshirish - agar yangi session bo'lsa, counter'ni tozalash
    // Bu refresh berilganda eski 401 xatolarini hisobga olinmasligi uchun
    const lastRefreshTime = sessionStorage.getItem('lastRefreshTime');
    const now = Date.now();
    
    // Agar lastRefreshTime yo'q bo'lsa, bu birinchi request - counter'ni tozalash
    if (!lastRefreshTime) {
      sessionStorage.setItem('lastRefreshTime', now.toString());
      sessionStorage.removeItem('failed401Requests');
    } else {
      // Agar 1 soniyadan ko'p vaqt o'tgan bo'lsa, yangi session deb hisoblash
      // Va counter'ni tozalash
      const timeSinceRefresh = now - parseInt(lastRefreshTime);
      if (timeSinceRefresh > 1000) {
        sessionStorage.setItem('lastRefreshTime', now.toString());
        sessionStorage.removeItem('failed401Requests');
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors of all responses
api.interceptors.response.use(
  (response) => {
    // Muvaffaqiyatli so'rov bo'lganda, 401 xatolar counter'ini tozalash
    // Bu foydalanuvchi tab o'zgartirib qaytganida, oldingi xatolar hisobga olinmasligi uchun
    // Muvaffaqiyatli so'rov token to'g'ri ekanligini ko'rsatadi, shuning uchun counter'ni tozalash
    sessionStorage.removeItem('failed401Requests');
    return response.data;
  },
  (err) => {
    if (err?.message === 'Network Error') {
      return Promise.reject({
        message:
          'Network Error: Unable to connect to server. Please check your internet connection.',
        statusCode: 0,
        data: null,
      });
    }
    
    // Handle 401 unauthorized - redirect to login
    // Faqat protected route'larda va signin sahifasida bo'lmaganda redirect qilish
    if (err?.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isPublicRoute = ['/signin', '/signup', '/forgot-password'].includes(currentPath);
      
      // Faqat protected route'larda token'ni o'chirish va redirect qilish
      if (!isPublicRoute) {
        // Token mavjudligini tekshirish
        const token = localStorage.getItem('token');
        if (!token) {
          // Token yo'q bo'lsa, darhol redirect qilish
          window.location.replace('/signin');
          return Promise.reject(
            err.response?.data || {
              message: 'Unauthorized',
              statusCode: 401,
              data: null,
            }
          );
        }
        
        // Login qilgandan keyin biror vaqt davomida 401 xatolarini e'tiborsiz qoldirish
        // Bu login qilgandan keyin dashboard yuklanganda biror API so'rovi 401 qaytarsa,
        // token'ni o'chirib yubormaslik uchun
        const lastLoginTime = localStorage.getItem('lastLoginTime');
        const now = Date.now();
        const timeSinceLogin = lastLoginTime ? now - parseInt(lastLoginTime) : Infinity;
        
        // Agar login qilgandan keyin 10 soniyadan kam vaqt o'tgan bo'lsa, 401 xatosini e'tiborsiz qoldirish
        // (5 soniyadan 10 soniyaga oshirildi - login keyin API so'rovlari uchun ko'proq vaqt)
        if (timeSinceLogin < 10000) {
          console.warn('Ignoring 401 error - recently logged in');
          return Promise.reject(
            err.response?.data || {
              message: err?.message || 'An error occurred',
              statusCode: err?.response?.status || 500,
              data: null,
            }
          );
        }
        
        // Token'ni o'chirishdan oldin, vaqt asosida 401 xatolarini tekshirish
        // Faqat qisqa vaqt ichida ketma-ket 401 xatolari bo'lsa, token'ni o'chirish
        let failed401Data;
        try {
          const stored = sessionStorage.getItem('failed401Requests');
          failed401Data = stored ? JSON.parse(stored) : { count: 0, lastErrorTime: null, errors: [] };
        } catch (e) {
          failed401Data = { count: 0, lastErrorTime: null, errors: [] };
        }
        
        const currentTime = Date.now();
        const timeWindow = 30000; // 30 soniya (15 dan 30 ga oshirildi)
        
        // 30 soniyadan eski xatolarni olib tashlash
        failed401Data.errors = failed401Data.errors.filter(
          (errorTime) => currentTime - errorTime < timeWindow
        );
        
        // Yangi xatoni qo'shish
        failed401Data.errors.push(currentTime);
        failed401Data.lastErrorTime = currentTime;
        failed401Data.count = failed401Data.errors.length;
        
        // Agar 30 soniya ichida 5 martadan ko'p 401 xatosi bo'lmasa, token'ni o'chirmaslik
        // (3 dan 5 ga oshirildi - faqat haqiqiy muammolarda o'chirish)
        if (failed401Data.count < 5) {
          sessionStorage.setItem('failed401Requests', JSON.stringify(failed401Data));
          
          // Token'ni o'chirmaslik, faqat xatoni qaytarish
          return Promise.reject(
            err.response?.data || {
              message: err?.message || 'An error occurred',
              statusCode: err?.response?.status || 500,
              data: null,
            }
          );
        }
        
        // Agar 30 soniya ichida 5 martadan ko'p 401 xatosi bo'lsa, token'ni o'chirish va redirect qilish
        // Bu haqiqiy autentifikatsiya muammosi ekanligini ko'rsatadi
        console.warn('Multiple 401 errors detected, clearing token');
        sessionStorage.removeItem('failed401Requests');
        sessionStorage.removeItem('storeSettingsFetched'); // StoreSettings fetch flag'ini ham tozalash
        localStorage.removeItem('token');
        localStorage.removeItem('storeId');
        localStorage.removeItem('storeData');
        localStorage.removeItem('lastLoginTime');
        
        // Custom event dispatch qilish - ProtectedRoute buni kuzatadi
        window.dispatchEvent(new Event('localStorageChange'));
        
        // Navigate'ni setTimeout bilan chaqirish - boshqa so'rovlar tugaguncha kutish
        setTimeout(() => {
          if (window.location.pathname !== '/signin') {
            window.location.replace('/signin');
          }
        }, 100);
      }
    }
    
    return Promise.reject(
      err.response?.data || {
        message: err?.message || 'An error occurred',
        statusCode: err?.response?.status || 500,
        data: null,
      }
    );
  }
);

export default api;

