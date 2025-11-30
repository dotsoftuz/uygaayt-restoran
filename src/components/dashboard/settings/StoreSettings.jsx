import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import TextEditor from '@/components/ui/text-editor';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  Clock,
  Truck,
  CreditCard,
  FileText,
  Store,
  Loader2,
  CheckCircle2,
  XCircle,
  Star,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

// Helper function to resize images
function resizeImage(file, maxWidth, maxHeight) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const fileName = file.name || `image_${Date.now()}.jpg`;
            const fileType = file.type || 'image/jpeg';
            resolve(new File([blob], fileName, { type: fileType }));
          },
          file.type || 'image/jpeg',
          0.9
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Helper function to format image URL
const formatImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  let url = imageUrl;
  if (url.startsWith('uploads/')) {
    url = url.replace('uploads/', '');
  }
  return `${cleanBaseUrl}/uploads/${url}`;
};

// Validation schemas
const basicInfoSchema = z.object({
  name: z.string().min(1, 'Do\'kon nomi majburiy'),
  phoneNumber: z.string().min(1, 'Telefon raqami majburiy'),
  email: z.string().email('Noto\'g\'ri email formati').optional().or(z.literal('')),
  website: z.string().url('Noto\'g\'ri URL formati').optional().or(z.literal('')),
});

const locationSchema = z.object({
  addressName: z.string().min(1, 'Manzil majburiy'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  workTime: z.string().optional(),
  workDays: z.array(z.string()).optional(),
});

const deliverySchema = z.object({
  deliveryPrice: z.number().min(0, 'Yetkazib berish narxi 0 dan kichik bo\'lmasligi kerak'),
  orderMinimumPrice: z.number().min(0, 'Minimal buyurtma narxi 0 dan kichik bo\'lmasligi kerak'),
  itemPrepTimeFrom: z.number().min(1, 'Tayyorlanish vaqti 1 dan kichik bo\'lmasligi kerak'),
  itemPrepTimeTo: z.number().min(1, 'Tayyorlanish vaqti 1 dan kichik bo\'lmasligi kerak'),
});

const DAYS = [
  { value: 'monday', label: 'Dushanba' },
  { value: 'tuesday', label: 'Seshanba' },
  { value: 'wednesday', label: 'Chorshanba' },
  { value: 'thursday', label: 'Payshanba' },
  { value: 'friday', label: 'Juma' },
  { value: 'saturday', label: 'Shanba' },
  { value: 'sunday', label: 'Yakshanba' },
];

function StoreSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeData, setStoreData] = useState(null);
  const [originalStoreData, setOriginalStoreData] = useState(null); // Original data for comparison
  const [activeTab, setActiveTab] = useState('basic');
  const [mapAddress, setMapAddress] = useState('');

  // Logo upload state
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoImageId, setLogoImageId] = useState(null);
  const logoFileInputRef = useRef(null);
  const [isLogoUploading, setIsLogoUploading] = useState(false);

  // Banner upload state
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerImageId, setBannerImageId] = useState(null);
  const bannerFileInputRef = useRef(null);
  const [isBannerUploading, setIsBannerUploading] = useState(false);

  // Track changes for each tab
  const [hasChanges, setHasChanges] = useState({
    basic: false,
    location: false,
    delivery: false,
    payment: false,
    description: false,
  });

  // Form instances
  const basicForm = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      website: '',
    },
  });

  const locationForm = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      addressName: '',
      latitude: undefined,
      longitude: undefined,
      workTime: '',
      workDays: [],
    },
  });

  const deliveryForm = useForm({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      deliveryPrice: 0,
      orderMinimumPrice: 0,
      itemPrepTimeFrom: 10,
      itemPrepTimeTo: 15,
    },
  });

  // Payment and status states
  const [paymentMethods, setPaymentMethods] = useState({
    acceptCash: false,
    acceptCard: false,
    acceptOnlinePayment: false,
  });

  const [statusFlags, setStatusFlags] = useState({
    isActive: true,
    isVerified: false,
    isPremium: false,
  });

  // Description states
  const [description, setDescription] = useState({
    uz: '',
    ru: '',
    en: '',
  });

  // Work days state
  const [workDays, setWorkDays] = useState([]);

  // Ref to track if fetch is in progress
  const fetchInProgressRef = useRef(false);

  // Fetch store data - faqat birinchi marta yoki komponent mount bo'lganda
  useEffect(() => {
    const fetchStoreData = async () => {
      // SessionStorage yordamida birinchi yuklanishni tekshirish
      // Agar bu session'da allaqachon fetch qilingan bo'lsa, faqat cached datani ko'rsatish
      const sessionFetched = sessionStorage.getItem('storeSettingsFetched');

      if (sessionFetched === 'true') {
        // Agar allaqachon fetch qilingan bo'lsa, faqat cached datani ko'rsatish
        try {
          const storeDataStr = localStorage.getItem('storeData');
          if (storeDataStr) {
            const cachedData = JSON.parse(storeDataStr);
            if (cachedData && Object.keys(cachedData).length > 0) {
              if (!storeData) {
                setStoreData(cachedData);
                setOriginalStoreData(JSON.parse(JSON.stringify(cachedData))); // Deep copy
                populateForms(cachedData);
              }
              setIsLoading(false);
            } else {
              setIsLoading(false);
            }
          } else {
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error parsing cached store data:', error);
          setIsLoading(false);
        }
        return;
      }

      // Agar fetch hozir ishlamoqda bo'lsa, kutish
      if (fetchInProgressRef.current) {
        return;
      }

      const token = localStorage.getItem('token');

      // Avval localStorage'dan ma'lumotni tekshirish
      // Agar ma'lumot mavjud bo'lsa, darhol ko'rsatish
      let hasCachedData = false;
      try {
        const storeDataStr = localStorage.getItem('storeData');
        if (storeDataStr) {
          const cachedData = JSON.parse(storeDataStr);
          if (cachedData && Object.keys(cachedData).length > 0) {
            setStoreData(cachedData);
            setOriginalStoreData(JSON.parse(JSON.stringify(cachedData))); // Deep copy
            populateForms(cachedData);
            hasCachedData = true;
            setIsLoading(false); // Cached data bor bo'lsa, loading'ni darhol to'xtatish
          }
        }
      } catch (error) {
        console.error('Error parsing cached store data:', error);
      }

      // Token yo'q bo'lsa, faqat cached data bilan ishlash
      if (!token) {
        if (!hasCachedData) {
          setIsLoading(false);
        }
        sessionStorage.setItem('storeSettingsFetched', 'true');
        return;
      }

      // API so'rovini faqat birinchi marta yoki cached data bo'lmasa qilish
      if (!hasCachedData) {
        setIsLoading(true);
      }

      fetchInProgressRef.current = true;

      try {
        await new Promise(resolve => setTimeout(resolve, 200));
        const response = await api.get('/store/get');
        const data = response?.data || response;

        if (data) {
          // Merge with existing localStorage data to preserve logo if backend doesn't return it
          try {
            const existingStoreDataStr = localStorage.getItem('storeData');
            if (existingStoreDataStr) {
              const existingStoreData = JSON.parse(existingStoreDataStr);
              // If backend data doesn't have logo but localStorage does, preserve it
              if (!data.logo && existingStoreData.logo) {
                data.logo = existingStoreData.logo;
              }
            }
          } catch (e) {
            console.error('Error merging store data:', e);
          }

          setStoreData(data);
          setOriginalStoreData(JSON.parse(JSON.stringify(data))); // Deep copy for comparison
          populateForms(data);
          localStorage.setItem('storeData', JSON.stringify(data));
          sessionStorage.setItem('storeSettingsFetched', 'true');

          // Trigger localStorage change event
          window.dispatchEvent(new Event('localStorageChange'));
        }
      } catch (error) {
        console.error('Error fetching store data:', error);

        // Agar cached data bo'lmasa va xatolik bo'lsa, xatolik xabarini ko'rsatish
        // Lekin 401 xatolik bo'lsa va cached data bo'lsa, xatolik xabarini ko'rsatmaslik
        // Chunki 401 xatolik API interceptor tomonidan boshqariladi
        const is401Error = error?.statusCode === 401 || error?.response?.status === 401;

        if (!hasCachedData && !is401Error) {
          toast.error('Do\'kon ma\'lumotlarini yuklashda xatolik yuz berdi');
        }

        // Agar cached data bo'lsa, fetch qilingan deb belgilash
        if (hasCachedData) {
          sessionStorage.setItem('storeSettingsFetched', 'true');
        }
      } finally {
        setIsLoading(false);
        fetchInProgressRef.current = false;
      }
    };

    fetchStoreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const populateForms = (data) => {
    // Basic info
    basicForm.reset({
      name: data.name || '',
      phoneNumber: data.phoneNumber || '',
      email: data.email || '',
      website: data.website || '',
    });

    // Load logo preview
    if (data.logo?.url) {
      const logoUrl = formatImageUrl(data.logo.url);
      setLogoPreview(logoUrl);
      setLogoImageId(data.logo._id || data.logoId);
    } else if (data.logoId) {
      setLogoImageId(data.logoId);
      // Logo URL will be populated when store data is fetched
    } else {
      setLogoPreview(null);
      setLogoImageId(null);
    }

    // Load banner preview
    if (data.banner?.url) {
      const bannerUrl = formatImageUrl(data.banner.url);
      setBannerPreview(bannerUrl);
      setBannerImageId(data.banner._id || data.bannerId);
    } else if (data.bannerId) {
      setBannerImageId(data.bannerId);
      // Banner URL will be populated when store data is fetched
    } else {
      setBannerPreview(null);
      setBannerImageId(null);
    }

    // Location
    locationForm.reset({
      addressName: data.addressName || '',
      latitude: data.addressLocation?.latitude || undefined,
      longitude: data.addressLocation?.longitude || undefined,
      workTime: data.workTime || '',
      workDays: data.workDays || [],
    });

    setMapAddress(data.addressName || '');

    // Delivery
    deliveryForm.reset({
      deliveryPrice: data.deliveryPrice || 0,
      orderMinimumPrice: data.orderMinimumPrice || 0,
      itemPrepTimeFrom: data.itemPrepTimeFrom || 10,
      itemPrepTimeTo: data.itemPrepTimeTo || 15,
    });

    // Payment methods
    setPaymentMethods({
      acceptCash: data.acceptCash || false,
      acceptCard: data.acceptCard || false,
      acceptOnlinePayment: data.acceptOnlinePayment || false,
    });

    // Status flags
    setStatusFlags({
      isActive: data.isActive !== undefined ? data.isActive : true,
      isVerified: data.isVerified || false,
      isPremium: data.isPremium || false,
    });

    // Description
    if (data.descriptionTranslate) {
      setDescription({
        uz: data.descriptionTranslate.uz || data.description || '',
        ru: data.descriptionTranslate.ru || '',
        en: data.descriptionTranslate.en || '',
      });
    } else {
      setDescription({
        uz: data.description || '',
        ru: '',
        en: '',
      });
    }

    // Work days - backend formatidan frontend formatiga o'girish
    if (data.workDays && Array.isArray(data.workDays) && data.workDays.length > 0) {
      // Agar backend formatida bo'lsa (object array)
      if (typeof data.workDays[0] === 'object' && data.workDays[0].day !== undefined) {
        const convertedWorkDays = convertWorkDaysFromBackendFormat(data.workDays);
        setWorkDays(convertedWorkDays);
        locationForm.setValue('workDays', convertedWorkDays);
      } else {
        // Agar frontend formatida bo'lsa (string array)
        setWorkDays(data.workDays);
        locationForm.setValue('workDays', data.workDays);
      }
    } else {
      setWorkDays([]);
      locationForm.setValue('workDays', []);
    }
  };

  // Get store type label
  const getStoreTypeLabel = () => {
    const storeType = storeData?.type || 'shop';
    return storeType === 'restaurant' ? 'Restoran sozlamalari' : 'Do\'kon sozlamalari';
  };

  // Check if basic form has changes
  useEffect(() => {
    if (!originalStoreData) return;

    const subscription = basicForm.watch((values) => {
      const hasBasicChanges =
        values.name !== (originalStoreData.name || '') ||
        values.phoneNumber !== (originalStoreData.phoneNumber || '') ||
        values.email !== (originalStoreData.email || '') ||
        values.website !== (originalStoreData.website || '');

      setHasChanges(prev => ({ ...prev, basic: hasBasicChanges }));
    });

    return () => subscription.unsubscribe();
  }, [basicForm, originalStoreData]);

  // Check if location form has changes
  useEffect(() => {
    if (!originalStoreData) return;

    const subscription = locationForm.watch((values) => {
      const originalLocation = originalStoreData.addressLocation || {};

      // Original workDays ni frontend formatiga o'girish (agar backend formatida bo'lsa)
      let originalWorkDays = originalStoreData.workDays || [];
      if (originalWorkDays.length > 0 && typeof originalWorkDays[0] === 'object' && originalWorkDays[0].day !== undefined) {
        originalWorkDays = convertWorkDaysFromBackendFormat(originalWorkDays);
      }

      const hasLocationChanges =
        values.addressName !== (originalStoreData.addressName || '') ||
        values.latitude !== originalLocation.latitude ||
        values.longitude !== originalLocation.longitude ||
        values.workTime !== (originalStoreData.workTime || '') ||
        JSON.stringify(workDays) !== JSON.stringify(originalWorkDays);

      setHasChanges(prev => ({ ...prev, location: hasLocationChanges }));
    });

    return () => subscription.unsubscribe();
  }, [locationForm, workDays, originalStoreData]);

  // Check if delivery form has changes
  useEffect(() => {
    if (!originalStoreData) return;

    const subscription = deliveryForm.watch((values) => {
      const hasDeliveryChanges =
        values.deliveryPrice !== (originalStoreData.deliveryPrice || 0) ||
        values.orderMinimumPrice !== (originalStoreData.orderMinimumPrice || 0) ||
        values.itemPrepTimeFrom !== (originalStoreData.itemPrepTimeFrom || 10) ||
        values.itemPrepTimeTo !== (originalStoreData.itemPrepTimeTo || 15);

      setHasChanges(prev => ({ ...prev, delivery: hasDeliveryChanges }));
    });

    return () => subscription.unsubscribe();
  }, [deliveryForm, originalStoreData]);

  // Check if payment/status has changes
  useEffect(() => {
    if (!originalStoreData) return;

    const hasPaymentChanges =
      paymentMethods.acceptCash !== (originalStoreData.acceptCash || false) ||
      paymentMethods.acceptCard !== (originalStoreData.acceptCard || false) ||
      paymentMethods.acceptOnlinePayment !== (originalStoreData.acceptOnlinePayment || false) ||
      statusFlags.isActive !== (originalStoreData.isActive !== undefined ? originalStoreData.isActive : true) ||
      statusFlags.isVerified !== (originalStoreData.isVerified || false) ||
      statusFlags.isPremium !== (originalStoreData.isPremium || false);

    setHasChanges(prev => ({ ...prev, payment: hasPaymentChanges }));
  }, [paymentMethods, statusFlags, originalStoreData]);

  // Check if description has changes
  useEffect(() => {
    if (!originalStoreData) return;

    const originalDesc = originalStoreData.descriptionTranslate || {};
    const hasDescriptionChanges =
      description.uz !== (originalDesc.uz || originalStoreData.description || '') ||
      description.ru !== (originalDesc.ru || '') ||
      description.en !== (originalDesc.en || '');

    setHasChanges(prev => ({ ...prev, description: hasDescriptionChanges }));
  }, [description, originalStoreData]);

  // Reset functions for each tab
  const resetBasicForm = () => {
    if (!originalStoreData) return;
    basicForm.reset({
      name: originalStoreData.name || '',
      phoneNumber: originalStoreData.phoneNumber || '',
      email: originalStoreData.email || '',
      website: originalStoreData.website || '',
    });
    setHasChanges(prev => ({ ...prev, basic: false }));
  };

  const resetLocationForm = () => {
    if (!originalStoreData) return;

    // workDays ni backend formatidan frontend formatiga o'girish
    let convertedWorkDays = [];
    if (originalStoreData.workDays && Array.isArray(originalStoreData.workDays) && originalStoreData.workDays.length > 0) {
      if (typeof originalStoreData.workDays[0] === 'object' && originalStoreData.workDays[0].day !== undefined) {
        convertedWorkDays = convertWorkDaysFromBackendFormat(originalStoreData.workDays);
      } else {
        convertedWorkDays = originalStoreData.workDays;
      }
    }

    locationForm.reset({
      addressName: originalStoreData.addressName || '',
      latitude: originalStoreData.addressLocation?.latitude || undefined,
      longitude: originalStoreData.addressLocation?.longitude || undefined,
      workTime: originalStoreData.workTime || '',
      workDays: convertedWorkDays,
    });
    setWorkDays(convertedWorkDays);
    setMapAddress(originalStoreData.addressName || '');
    if (originalStoreData.workTime) {
      setWorkTimeRange(parseWorkTime(originalStoreData.workTime));
    }
    setHasChanges(prev => ({ ...prev, location: false }));
  };

  const resetDeliveryForm = () => {
    if (!originalStoreData) return;
    deliveryForm.reset({
      deliveryPrice: originalStoreData.deliveryPrice || 0,
      orderMinimumPrice: originalStoreData.orderMinimumPrice || 0,
      itemPrepTimeFrom: originalStoreData.itemPrepTimeFrom || 10,
      itemPrepTimeTo: originalStoreData.itemPrepTimeTo || 15,
    });
    setHasChanges(prev => ({ ...prev, delivery: false }));
  };

  const resetPaymentStatus = () => {
    if (!originalStoreData) return;
    setPaymentMethods({
      acceptCash: originalStoreData.acceptCash || false,
      acceptCard: originalStoreData.acceptCard || false,
      acceptOnlinePayment: originalStoreData.acceptOnlinePayment || false,
    });
    setStatusFlags({
      isActive: originalStoreData.isActive !== undefined ? originalStoreData.isActive : true,
      isVerified: originalStoreData.isVerified || false,
      isPremium: originalStoreData.isPremium || false,
    });
    setHasChanges(prev => ({ ...prev, payment: false }));
  };

  const resetDescription = () => {
    if (!originalStoreData) return;
    if (originalStoreData.descriptionTranslate) {
      setDescription({
        uz: originalStoreData.descriptionTranslate.uz || originalStoreData.description || '',
        ru: originalStoreData.descriptionTranslate.ru || '',
        en: originalStoreData.descriptionTranslate.en || '',
      });
    } else {
      setDescription({
        uz: originalStoreData.description || '',
        ru: '',
        en: '',
      });
    }
    setHasChanges(prev => ({ ...prev, description: false }));
  };

  // Update original data after successful save
  const updateOriginalData = (updatedData) => {
    const mergedData = { ...originalStoreData, ...updatedData };
    setOriginalStoreData(JSON.parse(JSON.stringify(mergedData)));
    setStoreData(mergedData);
    localStorage.setItem('storeData', JSON.stringify(mergedData));
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Fayl hajmi 5MB dan katta');
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Noto\'g\'ri fayl formati. Faqat JPEG, PNG yoki WebP ruxsat etiladi');
      return;
    }

    // Show preview immediately
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      setLogoPreview(fileReader.result);
    };
    fileReader.readAsDataURL(file);

    // Store file for upload
    setLogoFile(file);
    setHasChanges(prev => ({ ...prev, basic: true }));
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    setLogoImageId(null);
    setHasChanges(prev => ({ ...prev, basic: true }));
  };

  const handleBannerUpload = async (file) => {
    if (!file) return;

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Fayl hajmi 5MB dan katta');
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Noto\'g\'ri fayl formati. Faqat JPEG, PNG yoki WebP ruxsat etiladi');
      return;
    }

    // Show preview immediately
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      setBannerPreview(fileReader.result);
    };
    fileReader.readAsDataURL(file);

    // Store file for upload
    setBannerFile(file);
    setHasChanges(prev => ({ ...prev, basic: true }));
  };

  const handleRemoveBanner = () => {
    setBannerPreview(null);
    setBannerFile(null);
    setBannerImageId(null);
    setHasChanges(prev => ({ ...prev, basic: true }));
  };

  const handleBasicSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let finalLogoId = logoImageId;
      let finalBannerId = bannerImageId;

      // Upload logo if new file is selected
      let uploadedLogoData = null;
      if (logoFile) {
        try {
          setIsLogoUploading(true);
          const resizedFile = await resizeImage(logoFile, 800, 800);
          const formData = new FormData();
          formData.append('file', resizedFile);
          const uploadResponse = await api.post('/image/upload', formData);
          uploadedLogoData = uploadResponse?.data || uploadResponse;

          if (uploadedLogoData?._id) {
            finalLogoId = uploadedLogoData._id;
            setLogoImageId(uploadedLogoData._id);
            setLogoFile(null);

            // Update preview with server URL
            if (uploadedLogoData.url) {
              const serverImageUrl = formatImageUrl(uploadedLogoData.url);
              if (serverImageUrl) {
                setLogoPreview(serverImageUrl);
              }
            }
          } else {
            throw new Error('Rasm yuklashda xatolik - image ID olinmadi');
          }
          setIsLogoUploading(false);
        } catch (error) {
          console.error('Error uploading logo:', error);
          toast.error('Logo yuklashda xatolik yuz berdi');
          setIsSubmitting(false);
          setIsLogoUploading(false);
          return;
        }
      }

      // Upload banner if new file is selected
      let uploadedBannerData = null;
      if (bannerFile) {
        try {
          setIsBannerUploading(true);
          const resizedFile = await resizeImage(bannerFile, 1920, 1080);
          const formData = new FormData();
          formData.append('file', resizedFile);
          const uploadResponse = await api.post('/image/upload', formData);
          uploadedBannerData = uploadResponse?.data || uploadResponse;

          if (uploadedBannerData?._id) {
            finalBannerId = uploadedBannerData._id;
            setBannerImageId(uploadedBannerData._id);
            setBannerFile(null);

            // Update preview with server URL
            if (uploadedBannerData.url) {
              const serverImageUrl = formatImageUrl(uploadedBannerData.url);
              if (serverImageUrl) {
                setBannerPreview(serverImageUrl);
              }
            }
          } else {
            throw new Error('Rasm yuklashda xatolik - image ID olinmadi');
          }
          setIsBannerUploading(false);
        } catch (error) {
          console.error('Error uploading banner:', error);
          toast.error('Banner yuklashda xatolik yuz berdi');
          setIsSubmitting(false);
          setIsBannerUploading(false);
          return;
        }
      }

      // Backend'da majburiy maydonlar: name, phoneNumber, workTime
      const updateData = {
        _id: storeData?._id,
        name: data.name,
        phoneNumber: data.phoneNumber,
        email: data.email || undefined,
        website: data.website || undefined,
        workTime: storeData?.workTime || '08:00-20:00', // Majburiy maydon
        ...(finalLogoId && { logoId: finalLogoId }),
        ...(finalBannerId && { bannerId: finalBannerId }),
      };

      const response = await api.put('/store/update', updateData);

      // Response'dan kelgan ma'lumotlarni ishlatish (agar backend yangilangan ma'lumotlarni qaytarsa)
      const updatedStoreData = response?.data || response || updateData;

      // Update logo and banner in storeData
      const updatedWithImages = {
        ...updatedStoreData,
      };

      if (finalLogoId && uploadedLogoData) {
        const logoUrl = uploadedLogoData.url || null;
        updatedWithImages.logoId = finalLogoId;
        updatedWithImages.logo = logoUrl ? {
          _id: finalLogoId,
          url: logoUrl,
        } : {
          _id: finalLogoId,
        };
      }

      if (finalBannerId && uploadedBannerData) {
        const bannerUrl = uploadedBannerData.url || null;
        updatedWithImages.bannerId = finalBannerId;
        updatedWithImages.banner = bannerUrl ? {
          _id: finalBannerId,
          url: bannerUrl,
        } : {
          _id: finalBannerId,
        };
      }

      // Update state and localStorage
      setStoreData(updatedWithImages);
      setOriginalStoreData(JSON.parse(JSON.stringify(updatedWithImages)));
      localStorage.setItem('storeData', JSON.stringify(updatedWithImages));

      // Trigger localStorage change event to update ProfileHeader
      window.dispatchEvent(new Event('localStorageChange'));

      // Also update original data
      updateOriginalData(updatedWithImages);

      // Form'ni yangilash
      basicForm.reset({
        name: updatedStoreData.name || data.name,
        phoneNumber: updatedStoreData.phoneNumber || data.phoneNumber,
        email: updatedStoreData.email || data.email,
        website: updatedStoreData.website || data.website,
      });

      setHasChanges(prev => ({ ...prev, basic: false }));
      toast.success('Asosiy ma\'lumotlar saqlandi');
    } catch (error) {
      console.error('Error updating basic info:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Ma\'lumotlarni saqlashda xatolik yuz berdi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Backend'da majburiy maydonlar: name, phoneNumber, workTime
      const workTime = data.workTime || (workTimeRange.start && workTimeRange.end
        ? `${workTimeRange.start}-${workTimeRange.end}`
        : storeData?.workTime || '08:00-20:00');

      // workDays ni backend formatiga o'girish
      const convertedWorkDays = convertWorkDaysToBackendFormat(workDays, workTime);

      const updateData = {
        _id: storeData?._id, // ← Bu qatorni qo'shing
        name: storeData?.name || '',
        phoneNumber: storeData?.phoneNumber || '',
        addressName: data.addressName,
        addressLocation: data.latitude && data.longitude ? {
          latitude: data.latitude,
          longitude: data.longitude,
        } : undefined,
        workTime: workTime,
        workDays: convertedWorkDays,
      };

      const response = await api.put('/store/update', updateData);

      // Response'dan kelgan ma'lumotlarni ishlatish
      const updatedStoreData = response?.data || response || updateData;

      // Update original data and local state
      updateOriginalData(updatedStoreData);

      // Map address'ni ham yangilash
      if (updatedStoreData.addressName) {
        setMapAddress(updatedStoreData.addressName);
      }

      // Work time range'ni yangilash
      if (updatedStoreData.workTime) {
        setWorkTimeRange(parseWorkTime(updatedStoreData.workTime));
      }

      // Work days'ni yangilash - backend formatidan frontend formatiga o'girish
      if (updatedStoreData.workDays) {
        const convertedWorkDays = convertWorkDaysFromBackendFormat(updatedStoreData.workDays);
        setWorkDays(convertedWorkDays);
      }

      // Form'ni yangilash
      const convertedWorkDaysForForm = updatedStoreData.workDays
        ? convertWorkDaysFromBackendFormat(updatedStoreData.workDays)
        : data.workDays || [];

      locationForm.reset({
        addressName: updatedStoreData.addressName || data.addressName,
        latitude: updatedStoreData.addressLocation?.latitude || data.latitude,
        longitude: updatedStoreData.addressLocation?.longitude || data.longitude,
        workTime: updatedStoreData.workTime || data.workTime,
        workDays: convertedWorkDaysForForm,
      });

      setHasChanges(prev => ({ ...prev, location: false }));
      toast.success('Manzil va ish vaqti saqlandi');
    } catch (error) {
      console.error('Error updating location:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Ma\'lumotlarni saqlashda xatolik yuz berdi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeliverySubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Backend'da majburiy maydonlar: name, phoneNumber, workTime
      const updateData = {
        _id: storeData?._id, // ← Bu qatorni qo'shing
        name: storeData?.name || '',
        phoneNumber: storeData?.phoneNumber || '',
        workTime: storeData?.workTime || '08:00-20:00',
        deliveryPrice: data.deliveryPrice || 0,
        orderMinimumPrice: data.orderMinimumPrice || 0,
        itemPrepTimeFrom: data.itemPrepTimeFrom || 10,
        itemPrepTimeTo: data.itemPrepTimeTo || 15,
      };

      const response = await api.put('/store/update', updateData);

      // Response'dan kelgan ma'lumotlarni ishlatish
      const updatedStoreData = response?.data || response || updateData;

      // Update original data and local state
      updateOriginalData(updatedStoreData);

      // Form'ni yangilash
      deliveryForm.reset({
        deliveryPrice: updatedStoreData.deliveryPrice ?? data.deliveryPrice,
        orderMinimumPrice: updatedStoreData.orderMinimumPrice ?? data.orderMinimumPrice,
        itemPrepTimeFrom: updatedStoreData.itemPrepTimeFrom ?? data.itemPrepTimeFrom,
        itemPrepTimeTo: updatedStoreData.itemPrepTimeTo ?? data.itemPrepTimeTo,
      });

      setHasChanges(prev => ({ ...prev, delivery: false }));
      toast.success('Yetkazib berish sozlamalari saqlandi');
    } catch (error) {
      console.error('Error updating delivery:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Ma\'lumotlarni saqlashda xatolik yuz berdi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentStatusSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Backend'da majburiy maydonlar: name, phoneNumber, workTime
      const updateData = {
        _id: storeData?._id, // ← Bu qatorni qo'shing
        name: storeData?.name || '',
        phoneNumber: storeData?.phoneNumber || '',
        workTime: storeData?.workTime || '08:00-20:00',
        acceptCash: paymentMethods.acceptCash,
        acceptCard: paymentMethods.acceptCard,
        acceptOnlinePayment: paymentMethods.acceptOnlinePayment,
        isActive: statusFlags.isActive,
        isVerified: statusFlags.isVerified,
        isPremium: statusFlags.isPremium,
      };

      const response = await api.put('/store/update', updateData);

      // Response'dan kelgan ma'lumotlarni ishlatish
      const updatedStoreData = response?.data || response || updateData;

      // Update original data and local state
      updateOriginalData(updatedStoreData);

      // Payment methods va status flags'ni ham yangilash (agar response'dan kelgan bo'lsa)
      if (updatedStoreData.acceptCash !== undefined) {
        setPaymentMethods({
          acceptCash: updatedStoreData.acceptCash || false,
          acceptCard: updatedStoreData.acceptCard || false,
          acceptOnlinePayment: updatedStoreData.acceptOnlinePayment || false,
        });
      }
      if (updatedStoreData.isActive !== undefined) {
        setStatusFlags({
          isActive: updatedStoreData.isActive !== undefined ? updatedStoreData.isActive : true,
          isVerified: updatedStoreData.isVerified || false,
          isPremium: updatedStoreData.isPremium || false,
        });
      }

      setHasChanges(prev => ({ ...prev, payment: false }));
      toast.success('To\'lov usullari va status saqlandi');
    } catch (error) {
      console.error('Error updating payment/status:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Ma\'lumotlarni saqlashda xatolik yuz berdi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDescriptionSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Backend'da majburiy maydonlar: name, phoneNumber, workTime
      const updateData = {
        _id: storeData?._id, // ← Bu qatorni qo'shing
        name: storeData?.name || '',
        phoneNumber: storeData?.phoneNumber || '',
        workTime: storeData?.workTime || '08:00-20:00',
        description: description.uz || '',
        descriptionTranslate: {
          uz: description.uz || '',
          ru: description.ru || '',
          en: description.en || '',
        },
      };

      const response = await api.put('/store/update', updateData);

      // Response'dan kelgan ma'lumotlarni ishlatish
      const updatedStoreData = response?.data || response || updateData;

      // Update original data and local state
      updateOriginalData(updatedStoreData);

      // Description'ni ham yangilash (agar response'dan kelgan bo'lsa)
      if (updatedStoreData.descriptionTranslate) {
        setDescription({
          uz: updatedStoreData.descriptionTranslate.uz || updatedStoreData.description || '',
          ru: updatedStoreData.descriptionTranslate.ru || '',
          en: updatedStoreData.descriptionTranslate.en || '',
        });
      } else if (updatedStoreData.description) {
        setDescription({
          uz: updatedStoreData.description || '',
          ru: '',
          en: '',
        });
      }

      setHasChanges(prev => ({ ...prev, description: false }));
      toast.success('Tavsif saqlandi');
    } catch (error) {
      console.error('Error updating description:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Ma\'lumotlarni saqlashda xatolik yuz berdi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kun nomlarini raqamga o'girish
  const dayNameToNumber = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
  };

  // Raqamdan kun nomiga o'girish
  const numberToDayName = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };

  // workDays ni backend formatiga o'girish (string array -> WorkDayDto array)
  const convertWorkDaysToBackendFormat = (workDaysArray, workTime) => {
    if (!workDaysArray || workDaysArray.length === 0) return undefined;

    const [startTime, endTime] = workTime ? workTime.split('-').map(t => t.trim()) : ['09:00', '18:00'];

    return workDaysArray
      .filter(dayName => dayNameToNumber[dayName] !== undefined)
      .map(dayName => ({
        day: dayNameToNumber[dayName],
        startTime: startTime,
        endTime: endTime,
        isWorking: true,
      }));
  };

  // Backend formatidan frontend formatiga o'girish (WorkDayDto array -> string array)
  const convertWorkDaysFromBackendFormat = (workDaysArray) => {
    if (!workDaysArray || !Array.isArray(workDaysArray)) return [];

    return workDaysArray
      .filter(day => day.isWorking !== false && numberToDayName[day.day])
      .map(day => numberToDayName[day.day])
      .filter(Boolean);
  };

  const toggleWorkDay = (day) => {
    setWorkDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const parseWorkTime = (workTime) => {
    if (!workTime) return { start: '09:00', end: '18:00' };
    const parts = workTime.split('-');
    return {
      start: parts[0]?.trim() || '09:00',
      end: parts[1]?.trim() || '18:00',
    };
  };

  const formatWorkTime = (start, end) => {
    return `${start}-${end}`;
  };

  const [workTimeRange, setWorkTimeRange] = useState({ start: '09:00', end: '18:00' });

  useEffect(() => {
    if (storeData?.workTime) {
      setWorkTimeRange(parseWorkTime(storeData.workTime));
    }
  }, [storeData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile/Tablet: Scrollable horizontal tabs */}
        <div className="lg:hidden overflow-x-auto scrollbar-hide -mx-4 px-4 pb-3">
          <TabsList className="inline-flex h-auto w-max min-w-full justify-start rounded-lg bg-muted p-1.5 gap-1.5">
            <TabsTrigger
              value="basic"
              className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0 px-2.5 sm:px-3 py-2"
            >
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline">Asosiy</span>
              <span className="sm:hidden">Asosiy</span>
            </TabsTrigger>
            <TabsTrigger
              value="location"
              className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0 px-2.5 sm:px-3 py-2"
            >
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline">Manzil</span>
              <span className="sm:hidden">Manzil</span>
            </TabsTrigger>
            <TabsTrigger
              value="delivery"
              className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0 px-2.5 sm:px-3 py-2"
            >
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline">Yetkazib berish</span>
              <span className="sm:hidden">Yetkazib</span>
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0 px-2.5 sm:px-3 py-2"
            >
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline">To'lov</span>
              <span className="sm:hidden">To'lov</span>
            </TabsTrigger>
            <TabsTrigger
              value="description"
              className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0 px-2.5 sm:px-3 py-2"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline">Tavsif</span>
              <span className="sm:hidden">Tavsif</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden lg:block">
          <TabsList className="grid w-full grid-cols-5 gap-2">
            <TabsTrigger value="basic" className="text-sm">
              <Store className="w-4 h-4 mr-2 flex-shrink-0" />
              Asosiy
            </TabsTrigger>
            <TabsTrigger value="location" className="text-sm">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              Manzil
            </TabsTrigger>
            <TabsTrigger value="delivery" className="text-sm">
              <Truck className="w-4 h-4 mr-2 flex-shrink-0" />
              Yetkazib berish
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-sm">
              <CreditCard className="w-4 h-4 mr-2 flex-shrink-0" />
              To'lov
            </TabsTrigger>
            <TabsTrigger value="description" className="text-sm">
              <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
              Tavsif
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="mt-6">
          <form onSubmit={basicForm.handleSubmit(handleBasicSubmit)} className="space-y-6">
            <div className="space-y-4">

              {/* Logo and Banner Upload - Improved Design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Logo Upload */}
                <div className="space-y-2">

                  <div className="flex items-start gap-3">
                    <div
                      className="relative w-20 h-20 flex-shrink-0 border border-border rounded-lg overflow-hidden cursor-pointer group bg-muted/30 hover:bg-muted/50 transition-colors"
                      onClick={() => logoFileInputRef.current?.click()}
                    >
                      {logoPreview ? (
                        <>
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemoveLogo(); }}
                            className="absolute top-1 right-1 p-1 bg-background/95 border border-border rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center">
                            <Upload className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={logoFileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file);
                        }}
                      />
                    </div>
                    <div className="flex-1 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="text-xs h-8"
                      >
                        {logoPreview ? 'O\'zgartirish' : 'Rasm yuklash'}
                      </Button>
                      {isLogoUploading && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Yuklanmoqda...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Banner Upload */}
                <div className="space-y-2">

                  <div className="flex items-start gap-3">
                    <div
                      className="relative w-36 h-20 flex-shrink-0 border border-border rounded-lg overflow-hidden cursor-pointer group bg-muted/30 hover:bg-muted/50 transition-colors"
                      onClick={() => bannerFileInputRef.current?.click()}
                    >
                      {bannerPreview ? (
                        <>
                          <img
                            src={bannerPreview}
                            alt="Banner preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemoveBanner(); }}
                            className="absolute top-1 right-1 p-1 bg-background/95 border border-border rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center">
                            <Upload className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={bannerFileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleBannerUpload(file);
                        }}
                      />
                    </div>
                    <div className="flex-1 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => bannerFileInputRef.current?.click()}
                        className="text-xs h-8"
                      >
                        {bannerPreview ? 'O\'zgartirish' : 'Rasm yuklash'}
                      </Button>
                      {isBannerUploading && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Yuklanmoqda...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label required className="text-xs sm:text-sm">
                  Do'kon nomi
                </Label>
                <Input
                  {...basicForm.register('name')}
                  placeholder="Do'kon nomi"
                  className="text-sm sm:text-base"
                />
                {basicForm.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {basicForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label required className="text-xs sm:text-sm">
                  Telefon raqami
                </Label>
                <Input
                  {...basicForm.register('phoneNumber')}
                  placeholder="+998901234567"
                  type="tel"
                  className="text-sm sm:text-base"
                />
                {basicForm.formState.errors.phoneNumber && (
                  <p className="text-xs text-destructive">
                    {basicForm.formState.errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label optional className="text-xs sm:text-sm">
                  Email
                </Label>
                <Input
                  {...basicForm.register('email')}
                  placeholder="info@example.com"
                  type="email"
                  className="text-sm sm:text-base"
                />
                {basicForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {basicForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label optional className="text-xs sm:text-sm">
                  Veb-sayt
                </Label>
                <Input
                  {...basicForm.register('website')}
                  placeholder="https://example.com"
                  type="url"
                  className="text-sm sm:text-base"
                />
                {basicForm.formState.errors.website && (
                  <p className="text-xs text-destructive">
                    {basicForm.formState.errors.website.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={resetBasicForm}
                disabled={!hasChanges.basic}
                className="text-xs sm:text-sm"
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !hasChanges.basic}
                className="text-xs sm:text-sm"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Saqlash
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Location & Hours Tab */}
        <TabsContent value="location" className="mt-6">
          <form onSubmit={locationForm.handleSubmit(handleLocationSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Manzil va ish vaqti</h3>

              <div className="space-y-2">
                <Label required className="text-xs sm:text-sm">
                  Manzil
                </Label>
                <Textarea
                  {...locationForm.register('addressName')}
                  placeholder="To'liq manzil"
                  className="text-sm sm:text-base min-h-[80px]"
                  onChange={(e) => {
                    locationForm.setValue('addressName', e.target.value);
                    setMapAddress(e.target.value);
                  }}
                />
                {locationForm.formState.errors.addressName && (
                  <p className="text-xs text-destructive">
                    {locationForm.formState.errors.addressName.message}
                  </p>
                )}
              </div>

              {mapAddress && (
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Xarita
                  </Label>
                  <div className="rounded-lg overflow-hidden border">
                    <iframe
                      width="100%"
                      height="250"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label optional className="text-xs sm:text-sm">
                    Kenglik (Latitude)
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="41.3160"
                    value={locationForm.watch('latitude') || ''}
                    onChange={(e) => locationForm.setValue('latitude', parseFloat(e.target.value) || undefined)}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label optional className="text-xs sm:text-sm">
                    Uzunlik (Longitude)
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="69.2641"
                    value={locationForm.watch('longitude') || ''}
                    onChange={(e) => locationForm.setValue('longitude', parseFloat(e.target.value) || undefined)}
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <h4 className="text-sm sm:text-base font-semibold">Ish vaqti</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Boshlanish vaqti</Label>
                    <Input
                      type="time"
                      value={workTimeRange.start}
                      onChange={(e) => {
                        setWorkTimeRange({ ...workTimeRange, start: e.target.value });
                        locationForm.setValue('workTime', formatWorkTime(e.target.value, workTimeRange.end));
                      }}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Tugash vaqti</Label>
                    <Input
                      type="time"
                      value={workTimeRange.end}
                      onChange={(e) => {
                        setWorkTimeRange({ ...workTimeRange, end: e.target.value });
                        locationForm.setValue('workTime', formatWorkTime(workTimeRange.start, e.target.value));
                      }}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Ish kunlari</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DAYS.map((day) => (
                      <div
                        key={day.value}
                        className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-accent"
                        onClick={() => toggleWorkDay(day.value)}
                      >
                        <Switch
                          checked={workDays.includes(day.value)}
                          onCheckedChange={() => toggleWorkDay(day.value)}
                        />
                        <Label className="text-xs sm:text-sm cursor-pointer">
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={resetLocationForm}
                disabled={!hasChanges.location}
                className="text-xs sm:text-sm"
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !hasChanges.location}
                className="text-xs sm:text-sm"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Saqlash
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="mt-6">
          <form onSubmit={deliveryForm.handleSubmit(handleDeliverySubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                <h3 className="text-base sm:text-lg font-semibold">Yetkazib berish sozlamalari</h3>
              </div>

              <div className="space-y-2">
                <Label required className="text-xs sm:text-sm">
                  Yetkazib berish narxi
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    {...deliveryForm.register('deliveryPrice', { valueAsNumber: true })}
                    className="text-sm sm:text-base"
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground">so'm</span>
                </div>
                {deliveryForm.formState.errors.deliveryPrice && (
                  <p className="text-xs text-destructive">
                    {deliveryForm.formState.errors.deliveryPrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label required className="text-xs sm:text-sm">
                  Minimal buyurtma narxi
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    {...deliveryForm.register('orderMinimumPrice', { valueAsNumber: true })}
                    className="text-sm sm:text-base"
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground">so'm</span>
                </div>
                {deliveryForm.formState.errors.orderMinimumPrice && (
                  <p className="text-xs text-destructive">
                    {deliveryForm.formState.errors.orderMinimumPrice.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label required className="text-xs sm:text-sm">
                    Tayyorlanish vaqti (dan)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      {...deliveryForm.register('itemPrepTimeFrom', { valueAsNumber: true })}
                      className="text-sm sm:text-base"
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground">daqiqa</span>
                  </div>
                  {deliveryForm.formState.errors.itemPrepTimeFrom && (
                    <p className="text-xs text-destructive">
                      {deliveryForm.formState.errors.itemPrepTimeFrom.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label required className="text-xs sm:text-sm">
                    Tayyorlanish vaqti (gacha)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      {...deliveryForm.register('itemPrepTimeTo', { valueAsNumber: true })}
                      className="text-sm sm:text-base"
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground">daqiqa</span>
                  </div>
                  {deliveryForm.formState.errors.itemPrepTimeTo && (
                    <p className="text-xs text-destructive">
                      {deliveryForm.formState.errors.itemPrepTimeTo.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={resetDeliveryForm}
                disabled={!hasChanges.delivery}
                className="text-xs sm:text-sm"
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !hasChanges.delivery}
                className="text-xs sm:text-sm"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Saqlash
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Payment & Status Tab */}
        <TabsContent value="payment" className="mt-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-base sm:text-lg font-semibold">To'lov usullari</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <Label className="text-sm sm:text-base font-medium">Naqd pul</Label>
                      <p className="text-xs text-muted-foreground">
                        Mijozlar naqd pul bilan to'lov qilishlari mumkin
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentMethods.acceptCash}
                    onCheckedChange={(checked) =>
                      setPaymentMethods({ ...paymentMethods, acceptCash: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <Label className="text-sm sm:text-base font-medium">Bank kartasi</Label>
                      <p className="text-xs text-muted-foreground">
                        Terminal yoki bank kartasi orqali to'lov
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentMethods.acceptCard}
                    onCheckedChange={(checked) =>
                      setPaymentMethods({ ...paymentMethods, acceptCard: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <Label className="text-sm sm:text-base font-medium">Onlayn to'lov</Label>
                      <p className="text-xs text-muted-foreground">
                        Onlayn to'lov tizimlari orqali to'lov
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentMethods.acceptOnlinePayment}
                    onCheckedChange={(checked) =>
                      setPaymentMethods({ ...paymentMethods, acceptOnlinePayment: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Status</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    {statusFlags.isActive ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <Label className="text-sm sm:text-base font-medium">Faol</Label>
                      <p className="text-xs text-muted-foreground">
                        Do'kon faol holatda va buyurtmalarni qabul qiladi
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={statusFlags.isActive}
                    onCheckedChange={(checked) =>
                      setStatusFlags({ ...statusFlags, isActive: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    {statusFlags.isVerified ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <Label className="text-sm sm:text-base font-medium">Tasdiqlangan</Label>
                      <p className="text-xs text-muted-foreground">
                        Do'kon ma'lumotlari tasdiqlangan
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={statusFlags.isVerified}
                    onCheckedChange={(checked) =>
                      setStatusFlags({ ...statusFlags, isVerified: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    {statusFlags.isPremium ? (
                      <Star className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Star className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <Label className="text-sm sm:text-base font-medium">Premium</Label>
                      <p className="text-xs text-muted-foreground">
                        Premium do'kon statusi
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={statusFlags.isPremium}
                    onCheckedChange={(checked) =>
                      setStatusFlags({ ...statusFlags, isPremium: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={resetPaymentStatus}
                disabled={!hasChanges.payment}
                className="text-xs sm:text-sm"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={handlePaymentStatusSubmit}
                disabled={isSubmitting || !hasChanges.payment}
                className="text-xs sm:text-sm"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Saqlash
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Description Tab */}
        <TabsContent value="description" className="mt-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Tavsif</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">O'zbekcha tavsif</Label>
                  <TextEditor
                    value={description.uz}
                    onChange={(value) => setDescription({ ...description, uz: value })}
                    placeholder="O'zbekcha tavsif kiriting..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Ruscha tavsif</Label>
                  <TextEditor
                    value={description.ru}
                    onChange={(value) => setDescription({ ...description, ru: value })}
                    placeholder="Ruscha tavsif kiriting..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Inglizcha tavsif</Label>
                  <TextEditor
                    value={description.en}
                    onChange={(value) => setDescription({ ...description, en: value })}
                    placeholder="Inglizcha tavsif kiriting..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={resetDescription}
                disabled={!hasChanges.description}
                className="text-xs sm:text-sm"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={handleDescriptionSubmit}
                disabled={isSubmitting || !hasChanges.description}
                className="text-xs sm:text-sm"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Saqlash
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default StoreSettings;
