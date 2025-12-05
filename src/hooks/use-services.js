import { useState } from 'react';
import { toast } from 'sonner';
import { useAppContext } from '@/context/AppContext';

export const useServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userUid } = useAppContext();

  // Firebase removed - use backend API instead
  const addService = async (serviceData) => {
    console.warn('addService: Firebase functionality removed, use backend API');
    setError('Service functionality is not available. Use backend API instead.');
    toast.error('Service functionality is not available. Use backend API instead.');
    throw new Error('Firebase functionality removed');
  };

  const updateService = async (serviceId, updatedData) => {
    console.warn('updateService: Firebase functionality removed, use backend API');
    setError('Service functionality is not available. Use backend API instead.');
    toast.error('Service functionality is not available. Use backend API instead.');
    throw new Error('Firebase functionality removed');
  };

  const deleteService = async (serviceId) => {
    console.warn('deleteService: Firebase functionality removed, use backend API');
    setError('Service functionality is not available. Use backend API instead.');
    toast.error('Service functionality is not available. Use backend API instead.');
    throw new Error('Firebase functionality removed');
  };

  return {
    services,
    loading,
    error,
    addService,
    updateService,
    deleteService,
  };
};
