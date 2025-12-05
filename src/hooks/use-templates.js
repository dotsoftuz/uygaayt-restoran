import { useState } from 'react';
import { toast } from 'sonner';
import { useAppContext } from '@/context/AppContext';

export const useTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userUid } = useAppContext();

  // Firebase removed - use backend API instead
  const addTemplate = async (templateData) => {
    console.warn('addTemplate: Firebase functionality removed, use backend API');
    setError('Template functionality is not available. Use backend API instead.');
    toast.error('Template functionality is not available. Use backend API instead.');
    throw new Error('Firebase functionality removed');
  };

  const updateTemplate = async (templateId, updatedData) => {
    console.warn('updateTemplate: Firebase functionality removed, use backend API');
    setError('Template functionality is not available. Use backend API instead.');
    toast.error('Template functionality is not available. Use backend API instead.');
    throw new Error('Firebase functionality removed');
  };

  const deleteTemplate = async (templateId) => {
    console.warn('deleteTemplate: Firebase functionality removed, use backend API');
    setError('Template functionality is not available. Use backend API instead.');
    toast.error('Template functionality is not available. Use backend API instead.');
    throw new Error('Firebase functionality removed');
  };

  return {
    templates,
    loading,
    error,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  };
};
