import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from 'sonner';
import { useAppContext } from '@/context/AppContext';

export const useServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userUid } = useAppContext();

  const fetchServices = () => {
    setLoading(true);
    setError(null);

    // Agar userUid bo'sh bo'lsa, xizmatlarni yuklamaslik
    if (!userUid) {
      setServices([]);
      setLoading(false);
      return null;
    }

    try {
      const servicesCollection = collection(db, `users/${userUid}/services`);
      const q = query(servicesCollection, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const servicesList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setServices(servicesList);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching services:', error);
          // Firebase permission xatoliklarini to'g'ri boshqarish
          if (error.code === 'permission-denied' || error.message?.includes('permission')) {
            setError('Firebase ruxsatlari yetarli emas. Iltimos, Firestore Security Rules\'ni tekshiring.');
            // Xatolikni ko'rsatmaslik, faqat bo'sh ro'yxat qaytarish
            setServices([]);
          } else {
            setError(error.message);
          }
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up services listener:', error);
      // Firebase permission xatoliklarini to'g'ri boshqarish
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        setError('Firebase ruxsatlari yetarli emas. Iltimos, Firestore Security Rules\'ni tekshiring.');
        setServices([]);
      } else {
        setError(error.message);
      }
      setLoading(false);
      return null;
    }
  };

  const addService = async (serviceData) => {
    if (!userUid) {
      const error = new Error('Foydalanuvchi ID mavjud emas');
      setError(error.message);
      toast.error("Xizmat qo'shishda xatolik yuz berdi");
      throw error;
    }

    try {
      setError(null);
      const servicesCollection = collection(db, `users/${userUid}/services`);
      const serviceWithTimestamp = {
        ...serviceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(servicesCollection, serviceWithTimestamp);
      toast.success("Xizmat muvaffaqiyatli qo'shildi");
    } catch (error) {
      console.error('Error adding service:', error);
      // Firebase permission xatoliklarini to'g'ri boshqarish
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        const errorMessage = 'Firebase ruxsatlari yetarli emas. Iltimos, Firestore Security Rules\'ni tekshiring.';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError(error.message);
        toast.error("Xizmat qo'shishda xatolik yuz berdi");
      }
      throw error;
    }
  };

  const updateService = async (serviceId, updatedData) => {
    if (!userUid) {
      const error = new Error('Foydalanuvchi ID mavjud emas');
      setError(error.message);
      toast.error('Xizmat yangilashda xatolik yuz berdi');
      throw error;
    }

    try {
      setError(null);
      const serviceDoc = doc(db, `users/${userUid}/services`, serviceId);
      const serviceWithTimestamp = {
        ...updatedData,
        updatedAt: new Date(),
      };

      await updateDoc(serviceDoc, serviceWithTimestamp);
      toast.success('Xizmat muvaffaqiyatli yangilandi');
    } catch (error) {
      console.error('Error updating service:', error);
      // Firebase permission xatoliklarini to'g'ri boshqarish
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        const errorMessage = 'Firebase ruxsatlari yetarli emas. Iltimos, Firestore Security Rules\'ni tekshiring.';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError(error.message);
        toast.error('Xizmat yangilashda xatolik yuz berdi');
      }
      throw error;
    }
  };

  const deleteService = async (serviceId) => {
    if (!userUid) {
      const error = new Error('Foydalanuvchi ID mavjud emas');
      setError(error.message);
      toast.error("Xizmat o'chirishda xatolik yuz berdi");
      throw error;
    }

    try {
      setError(null);
      const serviceDoc = doc(db, `users/${userUid}/services`, serviceId);
      await deleteDoc(serviceDoc);
      toast.success("Xizmat muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error('Error deleting service:', error);
      // Firebase permission xatoliklarini to'g'ri boshqarish
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        const errorMessage = 'Firebase ruxsatlari yetarli emas. Iltimos, Firestore Security Rules\'ni tekshiring.';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError(error.message);
        toast.error("Xizmat o'chirishda xatolik yuz berdi");
      }
      throw error;
    }
  };

  useEffect(() => {
    // Faqat userUid mavjud bo'lganda xizmatlarni yuklash
    if (!userUid) {
      setServices([]);
      setLoading(false);
      return;
    }

    const unsubscribe = fetchServices();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userUid]);

  return {
    services,
    loading,
    error,
    addService,
    updateService,
    deleteService,
  };
};
