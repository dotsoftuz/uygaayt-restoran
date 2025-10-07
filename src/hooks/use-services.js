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
          setError(error.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up services listener:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const addService = async (serviceData) => {
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
      setError(error.message);
      toast.error("Xizmat qo'shishda xatolik yuz berdi");
      throw error;
    }
  };

  const updateService = async (serviceId, updatedData) => {
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
      setError(error.message);
      toast.error('Xizmat yangilashda xatolik yuz berdi');
      throw error;
    }
  };

  const deleteService = async (serviceId) => {
    try {
      setError(null);
      const serviceDoc = doc(db, `users/${userUid}/services`, serviceId);
      await deleteDoc(serviceDoc);
      toast.success("Xizmat muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error('Error deleting service:', error);
      setError(error.message);
      toast.error("Xizmat o'chirishda xatolik yuz berdi");
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = fetchServices();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return {
    services,
    loading,
    error,
    addService,
    updateService,
    deleteService,
  };
};
