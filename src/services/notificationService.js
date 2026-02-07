// Bildirishnoma yordamchi funksiyalari
// Asosiy logika NotificationContext da joylashgan

import api from '@/services/api';

// Backend dan bildirishnomalarni olish
export async function fetchNotifications(params = {}) {
  try {
    const response = await api.get('/store/notifications', { params });
    return response?.data || response || [];
  } catch (error) {
    console.warn('Bildirishnomalarni olishda xatolik:', error?.message);
    return [];
  }
}

// Bildirishnomani o'qilgan deb belgilash (backend)
export async function markNotificationRead(notificationId) {
  try {
    await api.patch(`/store/notifications/${notificationId}/read`);
    return true;
  } catch {
    return false;
  }
}

// Barcha bildirishnomalarni o'qilgan deb belgilash (backend)
export async function markAllNotificationsRead() {
  try {
    await api.patch('/store/notifications/read-all');
    return true;
  } catch {
    return false;
  }
}

// Bildirishnomani o'chirish (backend)
export async function deleteNotification(notificationId) {
  try {
    await api.delete(`/store/notifications/${notificationId}`);
    return true;
  } catch {
    return false;
  }
}

// Bildirishnoma sozlamalarini olish (backend)
export async function fetchNotificationSettings() {
  try {
    const response = await api.get('/store/notification-settings');
    return response?.data || response || null;
  } catch {
    return null;
  }
}

// Bildirishnoma sozlamalarini saqlash (backend)
export async function saveNotificationSettings(settings) {
  try {
    await api.put('/store/notification-settings', settings);
    return true;
  } catch {
    return false;
  }
}

// Vaqt formatlash (relative time)
export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 30) return 'Hozirgina';
  if (diffMin < 1) return `${diffSec} soniya oldin`;
  if (diffMin < 60) return `${diffMin} daqiqa oldin`;
  if (diffHour < 24) return `${diffHour} soat oldin`;
  if (diffDay < 7) return `${diffDay} kun oldin`;
  return date.toLocaleDateString('uz-UZ');
}

// Bildirishnoma turi bo'yicha ikonka rangi
export function getNotificationTypeConfig(type) {
  switch (type) {
    case 'order':
      return { color: 'text-blue-500', bg: 'bg-blue-50', label: 'Buyurtma' };
    case 'complaint':
      return { color: 'text-red-500', bg: 'bg-red-50', label: 'Shikoyat' };
    case 'reminder':
      return { color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Eslatma' };
    case 'completed':
      return {
        color: 'text-green-500',
        bg: 'bg-green-50',
        label: 'Yakunlandi',
      };
    case 'system':
      return { color: 'text-gray-500', bg: 'bg-gray-50', label: 'Tizim' };
    default:
      return { color: 'text-gray-500', bg: 'bg-gray-50', label: 'Boshqa' };
  }
}

// Priority bo'yicha rang
export function getPriorityConfig(priority) {
  switch (priority) {
    case 'urgent':
      return {
        color: 'text-red-700',
        bg: 'bg-red-100 border-red-200',
        label: 'Shoshilinch',
      };
    case 'high':
      return {
        color: 'text-red-600',
        bg: 'bg-red-100 border-red-200',
        label: 'Yuqori',
      };
    case 'medium':
      return {
        color: 'text-yellow-700',
        bg: 'bg-yellow-100 border-yellow-200',
        label: "O'rta",
      };
    case 'low':
      return {
        color: 'text-green-700',
        bg: 'bg-green-100 border-green-200',
        label: 'Past',
      };
    default:
      return {
        color: 'text-gray-600',
        bg: 'bg-gray-100 border-gray-200',
        label: '',
      };
  }
}
