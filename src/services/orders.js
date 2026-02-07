import api from '@/services/api';

// Order yaratish
export async function createOrder(orderData) {
  try {
    const response = await api.post('/store/order', orderData);

    // NotificationContext ni to'g'ridan-to'g'ri chaqirish mumkin emas, shuning uchun
    // Custom event dispatch qilamiz
    window.dispatchEvent(
      new CustomEvent('orderCreated', {
        detail: response?.data || response,
      })
    );

    return response?.data || response;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Order statusini yangilash
export async function updateOrderStatus(orderId, status, additionalData = {}) {
  try {
    const response = await api.patch(`/store/order/${orderId}/status`, {
      status,
      ...additionalData,
    });

    // Custom event dispatch qilamiz
    window.dispatchEvent(
      new CustomEvent('orderStatusUpdated', {
        detail: {
          orderId,
          status,
          ...response?.data,
        },
      })
    );

    return response?.data || response;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Order ma'lumotlarini yangilash
export async function updateOrder(orderId, orderData) {
  try {
    const response = await api.put(`/store/order/${orderId}`, orderData);

    // Agar status o'zgargan bo'lsa, event dispatch qilamiz
    if (orderData.status) {
      window.dispatchEvent(
        new CustomEvent('orderStatusUpdated', {
          detail: {
            orderId,
            status: orderData.status,
            ...response?.data,
          },
        })
      );
    }

    return response?.data || response;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

// Orderlarni olish
export async function getOrders(params = {}) {
  try {
    const response = await api.post('/store/order/paging', params);
    return response?.data || response;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

// Bitta orderni olish
export async function getOrder(orderId) {
  try {
    const response = await api.get(`/store/order/get-by-id/${orderId}`);
    return response?.data || response;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

// Order ni o'chirish
export async function deleteOrder(orderId) {
  try {
    const response = await api.delete(`/store/order/${orderId}`);

    // Event dispatch qilamiz
    window.dispatchEvent(
      new CustomEvent('orderDeleted', {
        detail: { orderId },
      })
    );

    return response?.data || response;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}
