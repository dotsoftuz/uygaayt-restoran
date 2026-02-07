import api from '@/services/api';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

const NotificationContext = createContext({});

// LocalStorage keys
const STORAGE_KEYS = {
  NOTIFICATIONS: 'store_notifications',
  SETTINGS: 'store_notification_settings',
  LAST_CHECK: 'store_notification_last_check',
};

// Default sozlamalar
const DEFAULT_SETTINGS = {
  soundEnabled: true,
  soundVolume: 0.6,
  desktopEnabled: true,
  toastEnabled: true,
  pollingInterval: 15000, // 15 soniya
  types: {
    orders: true,
    complaints: true,
    system: true,
    reminders: true,
  },
};

// Reducer action turlari
const ACTIONS = {
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  ADD_NOTIFICATIONS_BATCH: 'ADD_NOTIFICATIONS_BATCH',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_ALL: 'CLEAR_ALL',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_CONNECTED: 'SET_CONNECTED',
};

// localStorage dan ma'lumot olish
function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

// localStorage ga saqlash
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage saqlashda xatolik:', e);
  }
}

// Vaqt formatlash
function formatNotificationTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // 1 minut ichida bo'lsa
  if (diffMs >= 0 && diffMs < 60 * 1000) return 'Hozirgina';

  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  // Bugun bo'lsa faqat vaqt (AM/PM)
  if (isSameDay) {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  // Oldingi sanalar: HH:mm - dd.MM.yy
  const hhmm = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${hhmm} - ${dd}.${mm}.${yy}`;
}

// Bildirishnoma turini aniqlash
function getNotificationType(notification) {
  if (notification.type) return notification.type;
  // Backend dan kelgan order ma'lumotiga qarab turini aniqlash
  if (notification.orderId || notification.order) return 'order';
  if (notification.complaint) return 'complaint';
  return 'system';
}

// Bildirishnoma priority aniqlash
function getNotificationPriority(notification) {
  if (notification.priority) return notification.priority;
  const type = getNotificationType(notification);
  if (type === 'order') return 'high';
  if (type === 'complaint') return 'high';
  return 'medium';
}

function getOrderStatusToastClassName(statusText) {
  const s = String(statusText || '').toLowerCase();
  if (!s) return 'bg-slate-600 text-white';
  if (s.includes('qabul')) return 'bg-orange-500 text-white';
  if (s.includes('yarat')) return 'bg-blue-500 text-white';
  if (s.includes('ishlan') || s.includes('jarayon'))
    return 'bg-yellow-600 text-white';
  if (s.includes('yetkaz')) return 'bg-purple-500 text-white';
  if (s.includes('yakun') || s.includes('bajar') || s.includes('tugat'))
    return 'bg-green-600 text-white';
  if (s.includes('bekor') || s.includes('cancel'))
    return 'bg-red-600 text-white';
  if (s.includes('kutil')) return 'bg-slate-500 text-white';
  return 'bg-slate-600 text-white';
}

function extractStatusTextFromNotification(notification) {
  const fromData =
    notification?.data?.status ||
    notification?.data?.order?.state?.name ||
    notification?.data?.order?.status ||
    notification?.data?.order?.state?.state;
  if (fromData) return fromData;

  const message = String(notification?.message || '');
  const match = message.match(/Status:\s*"([^"]+)"/);
  return match?.[1] || '';
}

// Reducer
function notificationReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload };

    case ACTIONS.ADD_NOTIFICATION: {
      // Dublikat tekshirish
      const exists = state.notifications.some(
        (n) => n.id === action.payload.id
      );
      if (exists) return state;
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    }

    case ACTIONS.ADD_NOTIFICATIONS_BATCH: {
      const existingIds = new Set(state.notifications.map((n) => n.id));
      const newOnes = action.payload.filter((n) => !existingIds.has(n.id));
      if (newOnes.length === 0) return state;
      return {
        ...state,
        notifications: [...newOnes, ...state.notifications],
      };
    }

    case ACTIONS.MARK_AS_READ: {
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, unread: false } : n
        ),
      };
    }

    case ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map((n) => ({
          ...n,
          unread: false,
        })),
      };

    case ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };

    case ACTIONS.CLEAR_ALL:
      return { ...state, notifications: [] };

    case ACTIONS.UPDATE_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case ACTIONS.SET_CONNECTED:
      return { ...state, isConnected: action.payload };

    default:
      return state;
  }
}

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context || Object.keys(context).length === 0) {
    throw new Error(
      'useNotificationContext must be used within NotificationProvider'
    );
  }
  return context;
};

// Socket.IO server URL (API base URL dan port olish)
const SOCKET_URL = (() => {
  const apiBase =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
  // /v1 qismini olib tashlash
  return apiBase.replace(/\/v1\/?$/, '');
})();

export const NotificationProvider = ({ children }) => {
  const audioRef = useRef(null);
  const socketRef = useRef(null);
  const pollingRef = useRef(null);
  const lastCheckRef = useRef(loadFromStorage(STORAGE_KEYS.LAST_CHECK, null));

  const storedNotifications = loadFromStorage(
    STORAGE_KEYS.NOTIFICATIONS,
    []
  ).map((n) => ({
    ...n,
    time: formatNotificationTime(n.createdAt),
  }));

  const initialState = {
    notifications: storedNotifications,
    settings: loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
    isConnected: false,
  };

  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Audio elementni yaratish
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = state.settings.soundVolume || 0.6;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Sozlamalar o'zgarganda audio volumeni yangilash
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.settings.soundVolume || 0.6;
    }
  }, [state.settings.soundVolume]);

  // localStorage ga saqlash - notifications
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, state.notifications);
  }, [state.notifications]);

  // localStorage ga saqlash - settings
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, state.settings);
  }, [state.settings]);

  // Tovush chalish
  const playSound = useCallback(() => {
    if (!state.settings.soundEnabled || !audioRef.current) return;
    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Brauzer autoplay bloklasa, xato e'tiborsiz qoldirish
      });
    } catch {
      // Audio xatoligini e'tiborsiz qoldirish
    }
  }, [state.settings.soundEnabled]);

  // Browser notification ko'rsatish
  const showDesktopNotification = useCallback(
    (notification) => {
      if (!state.settings.desktopEnabled) return;
      if (!('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      try {
        new Notification(notification.title || 'Yangi bildirishnoma', {
          body: notification.message || '',
          icon: '/favicon.ico',
          tag: String(notification.id),
          silent: true, // biz o'zimiz tovush chalaymiz
        });
      } catch {
        // Desktop notification xatoligi
      }
    },
    [state.settings.desktopEnabled]
  );

  // Toast notification ko'rsatish
  const showToast = useCallback(
    (notification) => {
      if (!state.settings.toastEnabled) return;
      const type = getNotificationType(notification);
      const priority = getNotificationPriority(notification);

      if (type === 'order') {
        const statusText = extractStatusTextFromNotification(notification);
        const className = getOrderStatusToastClassName(statusText);
        toast(notification.title || 'Yangi buyurtma!', {
          description: notification.message,
          duration: 5000,
          className,
          descriptionClassName: 'text-white/90',
        });
      } else if (type === 'complaint') {
        toast.warning(`⚠️ ${notification.title || 'Yangi shikoyat'}`, {
          description: notification.message,
          duration: 5000,
        });
      } else if (priority === 'high') {
        toast.error(notification.title || 'Muhim bildirishnoma', {
          description: notification.message,
          duration: 5000,
        });
      } else {
        toast(notification.title || 'Bildirishnoma', {
          description: notification.message,
          duration: 4000,
        });
      }
    },
    [state.settings.toastEnabled]
  );

  // Yangi bildirishnoma qo'shish (ichki + tashqi)
  const addNotification = useCallback(
    (notificationData) => {
      const notification = {
        id: notificationData.id || Date.now(),
        type: getNotificationType(notificationData),
        title: notificationData.title || 'Bildirishnoma',
        message: notificationData.message || '',
        time: formatNotificationTime(
          notificationData.createdAt || new Date().toISOString()
        ),
        createdAt: notificationData.createdAt || new Date().toISOString(),
        unread: true,
        priority: getNotificationPriority(notificationData),
        orderId: notificationData.orderId || null,
        data: notificationData.data || null,
      };

      // Tur filtrini tekshirish
      const typeKey =
        notification.type === 'order'
          ? 'orders'
          : notification.type === 'complaint'
            ? 'complaints'
            : 'system';
      if (!state.settings.types[typeKey]) return;

      dispatch({ type: ACTIONS.ADD_NOTIFICATION, payload: notification });
      playSound();
      showDesktopNotification(notification);
      showToast(notification);
    },
    [playSound, showDesktopNotification, showToast, state.settings.types]
  );

  // Yangi buyurtma bildirishnomasi
  const addOrderNotification = useCallback(
    (orderData) => {
      addNotification({
        id: orderData.id ? `order-${orderData.id}` : Date.now(),
        type: 'order',
        title: 'Yangi buyurtma!',
        message: `${orderData.customerName || orderData.clientName || 'Mijoz'} dan ${
          orderData.totalAmount || orderData.amount
            ? Number(orderData.totalAmount || orderData.amount).toLocaleString(
                'uz-UZ'
              )
            : '0'
        } so'mlik buyurtma`,
        orderId: orderData.id || orderData.orderId,
        createdAt: orderData.createdAt || new Date().toISOString(),
        data: orderData,
      });
    },
    [addNotification]
  );

  // Yangi shikoyat bildirishnomasi
  const addComplaintNotification = useCallback(
    (complaintData) => {
      addNotification({
        id: complaintData.id ? `complaint-${complaintData.id}` : Date.now(),
        type: 'complaint',
        title: 'Yangi shikoyat!',
        message: `${complaintData.clientName || 'Mijoz'} shikoyat bildirdi`,
        orderId: complaintData.orderId || null,
        createdAt: complaintData.createdAt || new Date().toISOString(),
        data: complaintData,
      });
    },
    [addNotification]
  );

  // O'qilgan deb belgilash
  const markAsRead = useCallback((notificationId) => {
    dispatch({ type: ACTIONS.MARK_AS_READ, payload: notificationId });
  }, []);

  // Hammasini o'qilgan deb belgilash
  const markAllAsRead = useCallback(() => {
    dispatch({ type: ACTIONS.MARK_ALL_AS_READ });
  }, []);

  // Bildirishnomani o'chirish
  const removeNotification = useCallback((notificationId) => {
    dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: notificationId });
  }, []);

  // Hammasini tozalash
  const clearAll = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ALL });
  }, []);

  // Sozlamalarni yangilash
  const updateSettings = useCallback((newSettings) => {
    dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: newSettings });
  }, []);

  // Browser notification ruxsatini so'rash
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    const permission = await Notification.requestPermission();
    return permission;
  }, []);

  // ============ SOCKET.IO REAL-TIME CONNECTION ============
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Socket.IO ulanish
    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected:', socket.id);
      dispatch({ type: ACTIONS.SET_CONNECTED, payload: true });
    });

    socket.on('TEST', (msg) => {
      console.log('[Socket.IO] Test message:', msg);
    });

    // Yangi buyurtma kelganda
    socket.on('orderCreated', (payload) => {
      console.log('[Socket.IO] orderCreated:', payload);
      const order = payload?.data || payload;
      if (!order) return;

      const customerName = order.customer
        ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
        : order.customerName || order.clientName;

      addOrderNotification({
        id: order._id || order.id,
        customerName,
        totalAmount: order.totalPrice || order.amount || order.totalAmount,
        createdAt: order.createdAt || new Date().toISOString(),
        data: order,
      });
    });

    // Buyurtma statusi o'zgarganda
    socket.on('orderUpdated', (payload) => {
      console.log('[Socket.IO] orderUpdated:', payload);
      const order = payload?.data || payload;
      if (!order) return;

      const statusLabels = {
        created: 'Yaratildi',
        inProcess: 'Ishlanmoqda',
        in_process: 'Ishlanmoqda',
        inDelivery: 'Yetkazib berilmoqda',
        in_delivery: 'Yetkazib berilmoqda',
        completed: 'Yakunlandi',
        cancelled: 'Bekor qilindi',
        pending: 'Kutilmoqda',
      };

      const stateStr = order.state?.state || order.status;
      const stateName = order.state?.name || statusLabels[stateStr] || stateStr;
      const orderId = order._id || order.id;
      const orderNumber = order.number || orderId;

      const customerName = order.customer
        ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
        : order.customerName;

      addNotification({
        id: `order-update-${orderId}-${Date.now()}`,
        type: 'order',
        title: `Buyurtma #${orderNumber} yangilandi`,
        message: `Status: "${stateName}"${customerName ? ` — ${customerName}` : ''}`,
        orderId,
        priority: stateStr === 'cancelled' ? 'high' : 'medium',
        createdAt: new Date().toISOString(),
        data: { status: stateStr, customerName, order },
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected:', reason);
      dispatch({ type: ACTIONS.SET_CONNECTED, payload: false });
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket.IO] Connection error:', error.message);
      dispatch({ type: ACTIONS.SET_CONNECTED, payload: false });
    });

    // Tozalash
    return () => {
      console.log('[Socket.IO] Cleaning up...');
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [addOrderNotification, addNotification]);

  // ============ POLLING FALLBACK (socket uzilsa) ============
  const checkNewOrders = useCallback(async () => {
    // Socket ulangan bo'lsa, polling kerak emas
    if (socketRef.current?.connected) return;

    const token = localStorage.getItem('token');
    const storeId = localStorage.getItem('storeId');
    if (!token || !storeId) return;

    try {
      const response = await api.post('/store/order/paging', {
        page: 1,
        limit: 20,
      });

      const orders =
        response?.data?.data || response?.data?.orders || response?.data || [];
      if (!Array.isArray(orders) || orders.length === 0) return;

      const lastCheck = lastCheckRef.current
        ? new Date(lastCheckRef.current)
        : null;
      const newOrders = lastCheck
        ? orders.filter((order) => new Date(order.createdAt) > lastCheck)
        : [];

      if (newOrders.length > 0) {
        newOrders.forEach((order) => {
          addOrderNotification({
            id: order._id,
            customerName: order.customer?.firstName
              ? `${order.customer.firstName} ${order.customer.lastName || ''}`
              : undefined,
            totalAmount: order.totalPrice || order.amount,
            createdAt: order.createdAt,
          });
        });
      }

      const now = new Date().toISOString();
      lastCheckRef.current = now;
      saveToStorage(STORAGE_KEYS.LAST_CHECK, now);
    } catch (error) {
      if (error?.response?.status !== 401) {
        console.warn('[Polling] Xatolik:', error?.message);
      }
    }
  }, [addOrderNotification]);

  // Polling fallback - faqat socket uzilganda ishlaydi
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Birinchi marta lastCheck ni o'rnatish (eski orderlar uchun notification bermaslik)
    if (!lastCheckRef.current) {
      const now = new Date().toISOString();
      lastCheckRef.current = now;
      saveToStorage(STORAGE_KEYS.LAST_CHECK, now);
    }

    // Polling interval (60 soniya - socket fallback sifatida)
    pollingRef.current = setInterval(checkNewOrders, 60000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [checkNewOrders]);

  // Desktop notification ruxsatini so'rash
  useEffect(() => {
    if (state.settings.desktopEnabled) {
      requestPermission();
    }
  }, [state.settings.desktopEnabled, requestPermission]);

  // Unread count
  const unreadCount = state.notifications.filter((n) => n.unread).length;

  const contextValue = {
    notifications: state.notifications,
    unreadCount,
    settings: state.settings,
    isConnected: state.isConnected,

    // Actions
    addNotification,
    addOrderNotification,
    addComplaintNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    updateSettings,
    requestPermission,
    playSound,
    checkNewOrders,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
