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
import YandexMap from '@/components/ui/yandex-map';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

// Helper function to format number with spaces (10 000)
const formatNumber = (value) => {
  if (!value && value !== 0) return '';
  const numStr = String(value).replace(/\s/g, '').replace(/,/g, '');
  if (!numStr) return '';
  const num = parseFloat(numStr);
  if (isNaN(num)) return '';
  return num.toLocaleString('uz-UZ').replace(/,/g, ' ');
};

// Helper function to parse formatted number
const parseNumber = (value) => {
  if (!value) return 0;
  const numStr = String(value).replace(/\s/g, '').replace(/,/g, '');
  const num = parseFloat(numStr);
  return isNaN(num) ? 0 : num;
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
  const [mapAddress, setMapAddress] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);

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

  const [isShowReview, setIsShowReview] = useState(true);

  // Track changes for each tab
  const [hasChanges, setHasChanges] = useState({
    basic: false,
    location: false,
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

  // Address location state for API call
  const [addressLocation, setAddressLocation] = useState(null);

  // Fetch address name by coordinates (like Admin app)
  useEffect(() => {
    const fetchAddressName = async () => {
      if (addressLocation?.latitude && addressLocation?.longitude) {
        try {
          const response = await api.post('/address/by-point', {
            latitude: addressLocation.latitude,
            longitude: addressLocation.longitude,
          });
          
          if (response?.data?.name) {
            locationForm.setValue('addressName', response.data.name);
            setMapAddress(response.data.name);
          }
        } catch (error) {
          console.error('Error fetching address name:', error);
          // Xatolik bo'lsa ham, YandexMap'dan kelgan manzilni ishlatish
        }
      }
    };

    fetchAddressName();
  }, [addressLocation]);

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
      // Fallback: if we have logoId but no logo object, log a warning
      // This should not happen after backend fix, but keeping for debugging
      console.warn('Logo ID exists but logo object is not populated. Logo ID:', data.logoId);
      setLogoImageId(data.logoId);
      setLogoPreview(null); // No preview available without URL
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
      // Fallback: if we have bannerId but no banner object, log a warning
      // This should not happen after backend fix, but keeping for debugging
      console.warn('Banner ID exists but banner object is not populated. Banner ID:', data.bannerId);
      setBannerImageId(data.bannerId);
      setBannerPreview(null); // No preview available without URL
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

    setIsShowReview(data.isShowReview !== undefined ? data.isShowReview : true);

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
      const originalIsShowReview = originalStoreData.isShowReview !== undefined ? originalStoreData.isShowReview : true;
      const hasBasicChanges =
        values.name !== (originalStoreData.name || '') ||
        values.phoneNumber !== (originalStoreData.phoneNumber || '') ||
        values.email !== (originalStoreData.email || '') ||
        values.website !== (originalStoreData.website || '') ||
        isShowReview !== originalIsShowReview;

      setHasChanges(prev => ({ ...prev, basic: hasBasicChanges }));
    });

    return () => subscription.unsubscribe();
  }, [basicForm, originalStoreData, isShowReview]);

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
    setIsShowReview(originalStoreData.isShowReview !== undefined ? originalStoreData.isShowReview : true);
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
    // Preserve logo and banner if they exist
    const preservedData = preserveImagesInResponse(mergedData, originalStoreData);
    setOriginalStoreData(JSON.parse(JSON.stringify(preservedData)));
    setStoreData(preservedData);
    localStorage.setItem('storeData', JSON.stringify(preservedData));
    // Trigger localStorage change event to update ProfileHeader
    window.dispatchEvent(new Event('localStorageChange'));
  };

  // Update forms when storeData changes (after save)
  useEffect(() => {
    if (storeData && originalStoreData) {
      const storeDataStr = JSON.stringify({
        name: storeData.name,
        phoneNumber: storeData.phoneNumber,
        email: storeData.email,
        website: storeData.website,
        addressName: storeData.addressName,
        addressLocation: storeData.addressLocation,
        workTime: storeData.workTime,
        workDays: storeData.workDays,
        deliveryPrice: storeData.deliveryPrice,
        orderMinimumPrice: storeData.orderMinimumPrice,
        itemPrepTimeFrom: storeData.itemPrepTimeFrom,
        itemPrepTimeTo: storeData.itemPrepTimeTo,
        logoId: storeData.logoId,
        bannerId: storeData.bannerId,
        isShowReview: storeData.isShowReview,
      });
      const originalDataStr = JSON.stringify({
        name: originalStoreData.name,
        phoneNumber: originalStoreData.phoneNumber,
        email: originalStoreData.email,
        website: originalStoreData.website,
        addressName: originalStoreData.addressName,
        addressLocation: originalStoreData.addressLocation,
        workTime: originalStoreData.workTime,
        workDays: originalStoreData.workDays,
        deliveryPrice: originalStoreData.deliveryPrice,
        orderMinimumPrice: originalStoreData.orderMinimumPrice,
        itemPrepTimeFrom: originalStoreData.itemPrepTimeFrom,
        itemPrepTimeTo: originalStoreData.itemPrepTimeTo,
        logoId: originalStoreData.logoId,
        bannerId: originalStoreData.bannerId,
        isShowReview: originalStoreData.isShowReview,
      });
      
      if (storeDataStr !== originalDataStr) {
        populateForms(storeData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeData, originalStoreData]);

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

  // Helper function to get current logo and banner IDs
  const getCurrentImageIds = () => {
    return {
      logoId: logoImageId || storeData?.logoId || storeData?.logo?._id,
      bannerId: bannerImageId || storeData?.bannerId || storeData?.banner?._id,
    };
  };

  // Helper function to preserve logo and banner in updated data
  const preserveImagesInResponse = (responseData, currentData) => {
    const preserved = { ...responseData };
    
    // Preserve logo if it exists in response or current data
    if (responseData?.logo) {
      preserved.logo = responseData.logo;
      preserved.logoId = responseData.logo._id || responseData.logoId;
    } else if (currentData?.logo) {
      preserved.logo = currentData.logo;
      preserved.logoId = currentData.logoId || currentData.logo._id;
    } else if (currentData?.logoId) {
      preserved.logoId = currentData.logoId;
    }

    // Preserve banner if it exists in response or current data
    if (responseData?.banner) {
      preserved.banner = responseData.banner;
      preserved.bannerId = responseData.banner._id || responseData.bannerId;
    } else if (currentData?.banner) {
      preserved.banner = currentData.banner;
      preserved.bannerId = currentData.bannerId || currentData.banner._id;
    } else if (currentData?.bannerId) {
      preserved.bannerId = currentData.bannerId;
    }

    return preserved;
  };

  const handleBasicSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let finalLogoId = logoImageId || storeData?.logoId || storeData?.logo?._id;
      let finalBannerId = bannerImageId || storeData?.bannerId || storeData?.banner?._id;

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
        isShowReview: isShowReview !== undefined ? isShowReview : true,
        ...(finalLogoId && { logoId: finalLogoId }),
        ...(finalBannerId && { bannerId: finalBannerId }),
      };

      const response = await api.put('/store/update', updateData);

      const updatedStoreData = response?.data || response || updateData;
      
      if (updatedStoreData.isShowReview !== undefined) {
        setIsShowReview(updatedStoreData.isShowReview);
      }

      // Update logo and banner in storeData
      let updatedWithImages = { ...updatedStoreData };

      // If new logo was uploaded, use uploaded data
      if (finalLogoId && uploadedLogoData) {
        const logoUrl = uploadedLogoData.url || null;
        updatedWithImages.logoId = finalLogoId;
        updatedWithImages.logo = logoUrl ? {
          _id: finalLogoId,
          url: logoUrl,
        } : {
          _id: finalLogoId,
        };
      } else if (finalLogoId) {
        // Preserve existing logo
        updatedWithImages.logoId = finalLogoId;
        if (storeData?.logo) {
          updatedWithImages.logo = storeData.logo;
        } else if (updatedStoreData?.logo) {
          updatedWithImages.logo = updatedStoreData.logo;
        }
      }

      // If new banner was uploaded, use uploaded data
      if (finalBannerId && uploadedBannerData) {
        const bannerUrl = uploadedBannerData.url || null;
        updatedWithImages.bannerId = finalBannerId;
        updatedWithImages.banner = bannerUrl ? {
          _id: finalBannerId,
          url: bannerUrl,
        } : {
          _id: finalBannerId,
        };
      } else if (finalBannerId) {
        // Preserve existing banner
        updatedWithImages.bannerId = finalBannerId;
        if (storeData?.banner) {
          updatedWithImages.banner = storeData.banner;
        } else if (updatedStoreData?.banner) {
          updatedWithImages.banner = updatedStoreData.banner;
        }
      }

      // Preserve images from response if they exist
      updatedWithImages = preserveImagesInResponse(updatedWithImages, storeData);

      // Update original data and local state (this also updates localStorage and triggers event)
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

      // Get current logo and banner IDs to preserve them
      const { logoId, bannerId } = getCurrentImageIds();

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
        isShowReview: isShowReview !== undefined ? isShowReview : true,
        ...(logoId && { logoId }),
        ...(bannerId && { bannerId }),
      };

      const response = await api.put('/store/update', updateData);

      const updatedStoreData = response?.data || response || updateData;
      
      if (updatedStoreData.isShowReview !== undefined) {
        setIsShowReview(updatedStoreData.isShowReview);
      }

      const updatedWithImages = preserveImagesInResponse(updatedStoreData, storeData);

      updateOriginalData(updatedWithImages);

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


  const handleDescriptionSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Get current logo and banner IDs to preserve them
      const { logoId, bannerId } = getCurrentImageIds();

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
        isShowReview: isShowReview !== undefined ? isShowReview : true,
        ...(logoId && { logoId }),
        ...(bannerId && { bannerId }),
      };

      const response = await api.put('/store/update', updateData);

      const updatedStoreData = response?.data || response || updateData;
      
      if (updatedStoreData.isShowReview !== undefined) {
        setIsShowReview(updatedStoreData.isShowReview);
      }

      const updatedWithImages = preserveImagesInResponse(updatedStoreData, storeData);

      updateOriginalData(updatedWithImages);

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

  // Bitta umumiy submit funksiyasi - barcha sozlamalarni saqlaydi
  const handleSaveAll = async () => {
    // Barcha formlarni validatsiya qilish
    const basicData = basicForm.getValues();
    const locationData = locationForm.getValues();

    // Basic form validatsiyasi
    try {
      await basicForm.trigger();
      if (!basicForm.formState.isValid) {
        toast.error('Asosiy ma\'lumotlarda xatolik bor. Iltimos, tekshiring.');
        return;
      }
    } catch (error) {
      toast.error('Asosiy ma\'lumotlarda xatolik bor.');
      return;
    }

    // Location form validatsiyasi
    try {
      await locationForm.trigger();
      if (!locationForm.formState.isValid) {
        toast.error('Manzil ma\'lumotlarida xatolik bor. Iltimos, tekshiring.');
        return;
      }
    } catch (error) {
      toast.error('Manzil ma\'lumotlarida xatolik bor.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalLogoId = logoImageId || storeData?.logoId || storeData?.logo?._id;
      let finalBannerId = bannerImageId || storeData?.bannerId || storeData?.banner?._id;

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

      // Work time va work days ni tayyorlash
      const workTime = locationData.workTime || (workTimeRange.start && workTimeRange.end
        ? `${workTimeRange.start}-${workTimeRange.end}`
        : storeData?.workTime || '08:00-20:00');
      const convertedWorkDays = convertWorkDaysToBackendFormat(workDays, workTime);

      // Barcha ma'lumotlarni bitta obyektga yig'ish
      const updateData = {
        _id: storeData?._id,
        name: basicData.name,
        phoneNumber: basicData.phoneNumber,
        email: basicData.email || undefined,
        website: basicData.website || undefined,
        addressName: locationData.addressName,
        addressLocation: locationData.latitude && locationData.longitude ? {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        } : undefined,
        workTime: workTime,
        workDays: convertedWorkDays,
        description: description.uz || '',
        descriptionTranslate: {
          uz: description.uz || '',
          ru: description.ru || '',
          en: description.en || '',
        },
        isShowReview: isShowReview !== undefined ? isShowReview : true,
        ...(finalLogoId && { logoId: finalLogoId }),
        ...(finalBannerId && { bannerId: finalBannerId }),
      };

      const response = await api.put('/store/update', updateData);
      const updatedStoreData = response?.data || response || updateData;
      
      if (updatedStoreData.isShowReview !== undefined) {
        setIsShowReview(updatedStoreData.isShowReview);
      }

      let updatedWithImages = { ...updatedStoreData };

      if (finalLogoId && uploadedLogoData) {
        const logoUrl = uploadedLogoData.url || null;
        updatedWithImages.logoId = finalLogoId;
        updatedWithImages.logo = logoUrl ? {
          _id: finalLogoId,
          url: logoUrl,
        } : {
          _id: finalLogoId,
        };
      } else if (finalLogoId) {
        updatedWithImages.logoId = finalLogoId;
        if (storeData?.logo) {
          updatedWithImages.logo = storeData.logo;
        } else if (updatedStoreData?.logo) {
          updatedWithImages.logo = updatedStoreData.logo;
        }
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
      } else if (finalBannerId) {
        updatedWithImages.bannerId = finalBannerId;
        if (storeData?.banner) {
          updatedWithImages.banner = storeData.banner;
        } else if (updatedStoreData?.banner) {
          updatedWithImages.banner = updatedStoreData.banner;
        }
      }

      updatedWithImages = preserveImagesInResponse(updatedWithImages, storeData);

      // Update state and localStorage
      setStoreData(updatedWithImages);
      setOriginalStoreData(JSON.parse(JSON.stringify(updatedWithImages)));
      localStorage.setItem('storeData', JSON.stringify(updatedWithImages));
      window.dispatchEvent(new Event('localStorageChange'));
      updateOriginalData(updatedWithImages);

      // Update all forms
      basicForm.reset({
        name: updatedStoreData.name || basicData.name,
        phoneNumber: updatedStoreData.phoneNumber || basicData.phoneNumber,
        email: updatedStoreData.email || basicData.email,
        website: updatedStoreData.website || basicData.website,
      });

      const convertedWorkDaysForForm = updatedStoreData.workDays
        ? convertWorkDaysFromBackendFormat(updatedStoreData.workDays)
        : workDays;

      locationForm.reset({
        addressName: updatedStoreData.addressName || locationData.addressName,
        latitude: updatedStoreData.addressLocation?.latitude || locationData.latitude,
        longitude: updatedStoreData.addressLocation?.longitude || locationData.longitude,
        workTime: updatedStoreData.workTime || workTime,
        workDays: convertedWorkDaysForForm,
      });

      if (updatedStoreData.workTime) {
        setWorkTimeRange(parseWorkTime(updatedStoreData.workTime));
      }

      if (updatedStoreData.workDays) {
        const convertedWorkDays = convertWorkDaysFromBackendFormat(updatedStoreData.workDays);
        setWorkDays(convertedWorkDays);
      }

      if (updatedStoreData.addressName) {
        setMapAddress(updatedStoreData.addressName);
      }


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

      // Reset all change flags
      setHasChanges({
        basic: false,
        location: false,
        description: false,
      });

      toast.success('Barcha sozlamalar muvaffaqiyatli saqlandi');
    } catch (error) {
      console.error('Error updating store settings:', error);
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
      const newWorkDays = prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day];
      
      // Update form value
      locationForm.setValue('workDays', newWorkDays);
      
      // Mark location as changed
      setHasChanges(prev => ({ ...prev, location: true }));
      
      return newWorkDays;
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
    <div className="space-y-8">
      {/* Basic Info Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Store className="w-5 h-5" />
          <h2 className="text-lg sm:text-xl font-semibold">Asosiy ma'lumotlar</h2>
        </div>
          <div className="space-y-6">
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
                  disabled
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
          </div>
      </div>

      {/* Location & Hours Section */}
      <div className="space-y-4 pt-6 border-t">
        <div className="flex items-center gap-2 pb-2 border-b">
          <MapPin className="w-5 h-5" />
          <h2 className="text-lg sm:text-xl font-semibold">Manzil va ish vaqti</h2>
        </div>
          <div className="space-y-6">
              <div className="space-y-4">
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

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Xarita - Joyni tanlang
                </Label>
                <YandexMap
                  center={
                    locationForm.watch('latitude') && locationForm.watch('longitude')
                      ? {
                          latitude: locationForm.watch('latitude'),
                          longitude: locationForm.watch('longitude'),
                        }
                      : undefined
                  }
                  onCoordinateChange={(coords) => {
                    locationForm.setValue('latitude', coords.latitude);
                    locationForm.setValue('longitude', coords.longitude);
                    // Set addressLocation to trigger API call for address name
                    setAddressLocation({
                      latitude: coords.latitude,
                      longitude: coords.longitude,
                    });
                  }}
                  onAddressChange={(address) => {
                    // This is a fallback if API doesn't work, but API should be primary
                    // Only set if address is valid (not coordinates)
                    if (address && address.trim() !== '' && !/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(address.trim()) && !/\d+\.\d+,\s*\d+\.\d+/.test(address)) {
                      locationForm.setValue('addressName', address);
                      setMapAddress(address);
                    }
                  }}
                  height="400px"
                  zoom={14}
                />
                <p className="text-xs text-muted-foreground">
                  Xaritada joyni tanlang yoki pin'ni surib o'zgartiring. Manzil avtomatik yangilanadi.
                </p>
              </div>

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
          </div>
      </div>

      <div className="space-y-4 pt-6 border-t">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Star className="w-5 h-5" />
          <h2 className="text-lg sm:text-xl font-semibold">Sharh va reyting</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Sharh va reytingni ko'rsatish</Label>
              <p className="text-xs text-muted-foreground">
                Mijoz dasturida sharh va reyting ko'rsatilsin yoki faqat ish vaqti ko'rsatilsin
              </p>
            </div>
            <Switch
              checked={isShowReview}
              onCheckedChange={(checked) => {
                setIsShowReview(checked);
                setHasChanges(prev => ({ ...prev, basic: true }));
              }}
            />
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-4 pt-6 border-t">
        <div className="flex items-center gap-2 pb-2 border-b">
          <FileText className="w-5 h-5" />
          <h2 className="text-lg sm:text-xl font-semibold">Tavsif</h2>
        </div>
          <div className="space-y-6">
            <div className="space-y-4">
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
          </div>
      </div>

      {/* Bitta umumiy Saqlash tugmasi */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t pt-4 pb-4 mt-8 z-10">
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCancelDialog(true)}
            disabled={!Object.values(hasChanges).some(hasChange => hasChange)}
            className="text-sm sm:text-base"
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={isSubmitting || !Object.values(hasChanges).some(hasChange => hasChange)}
            className="text-sm sm:text-base min-w-[120px]"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Saqlash
          </Button>
        </div>
      </div>

      {/* Bekor qilish dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bekor qilish</DialogTitle>
            <DialogDescription>
              Barcha o'zgarishlar bekor qilinadi va asl qiymatlarga qaytadi. Bu amalni bekor qilib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Yopish
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetBasicForm();
                resetLocationForm();
                resetDescription();
                setShowCancelDialog(false);
                toast.success('Barcha o\'zgarishlar bekor qilindi');
              }}
            >
              Bekor qilish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StoreSettings;
