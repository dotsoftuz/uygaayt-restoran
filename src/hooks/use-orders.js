import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';

export const useOrders = () => {
  const { orders, addOrder, updateOrder, deleteOrder, userUid } =
    useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create new order
  const createOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const orderId = await addOrder(orderData);
      toast.success('Buyurtma muvaffaqiyatli yaratildi');
      return orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.message);
      toast.error('Buyurtma yaratishda xatolik yuz berdi');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update existing order
  const editOrder = async (orderId, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      await updateOrder(orderId, updatedData);
      toast.success('Buyurtma muvaffaqiyatli yangilandi');
      return orderId;
    } catch (error) {
      console.error('Error updating order:', error);
      setError(error.message);
      toast.error('Buyurtma yangilashda xatolik yuz berdi');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete order
  const removeOrder = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteOrder(orderId);
      toast.success("Buyurtma muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error('Error deleting order:', error);
      setError(error.message);
      toast.error("Buyurtma o'chirishda xatolik yuz berdi");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get order by ID
  const getOrderById = (orderId) => {
    return orders.find((order) => order.id === orderId);
  };

  // Get orders by client ID
  const getOrdersByClient = (clientId) => {
    return orders.filter((order) => order.clientId === clientId);
  };

  // Get orders by date range
  const getOrdersByDateRange = (startDate, endDate) => {
    return orders.filter((order) => {
      const orderDate = new Date(
        order.createdAt?.toDate?.() || order.createdAt
      );
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  // Get orders by status (if you add status field)
  const getOrdersByStatus = (status) => {
    return orders.filter((order) => order.status === status);
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    editOrder,
    removeOrder,
    getOrderById,
    getOrdersByClient,
    getOrdersByDateRange,
    getOrdersByStatus,
  };
};
