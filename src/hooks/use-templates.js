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

export const useTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userUid } = useAppContext();

  const fetchTemplates = () => {
    setLoading(true);
    setError(null);

    try {
      const templatesCollection = collection(db, `users/${userUid}/templates`);
      const q = query(templatesCollection, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const templatesList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTemplates(templatesList);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching templates:', error);
          setError(error.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up templates listener:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const addTemplate = async (templateData) => {
    try {
      setError(null);
      const templatesCollection = collection(db, `users/${userUid}/templates`);
      const templateWithTimestamp = {
        ...templateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(templatesCollection, templateWithTimestamp);
      toast.success('Shablon muvaffaqiyatli saqlandi');
      return docRef.id;
    } catch (error) {
      console.error('Error adding template:', error);
      setError(error.message);
      toast.error('Shablon saqlashda xatolik yuz berdi');
      throw error;
    }
  };

  const updateTemplate = async (templateId, updatedData) => {
    try {
      setError(null);
      const templateDoc = doc(db, `users/${userUid}/templates`, templateId);
      const templateWithTimestamp = {
        ...updatedData,
        updatedAt: new Date(),
      };

      await updateDoc(templateDoc, templateWithTimestamp);
      toast.success('Shablon muvaffaqiyatli yangilandi');
    } catch (error) {
      console.error('Error updating template:', error);
      setError(error.message);
      toast.error('Shablon yangilashda xatolik yuz berdi');
      throw error;
    }
  };

  const deleteTemplate = async (templateId) => {
    try {
      setError(null);
      const templateDoc = doc(db, `users/${userUid}/templates`, templateId);
      await deleteDoc(templateDoc);
      toast.success("Shablon muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error('Error deleting template:', error);
      setError(error.message);
      toast.error("Shablon o'chirishda xatolik yuz berdi");
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = fetchTemplates();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return {
    templates,
    loading,
    error,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  };
};
