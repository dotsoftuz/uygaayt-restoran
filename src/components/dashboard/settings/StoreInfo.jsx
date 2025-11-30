import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Loader2, Upload, X } from 'lucide-react';
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

const storeInfoSchema = z.object({
  name: z.string().min(1, 'Do\'kon nomi majburiy'),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  phone: z.string().min(1, 'Telefon raqami majburiy'),
  email: z.string().email('Noto\'g\'ri email formati').optional().or(z.literal('')),
  address: z.string().min(1, 'Manzil majburiy'),
});

function StoreInfo() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mapAddress, setMapAddress] = useState('');
  const [storeData, setStoreData] = useState(null);

  // Logo upload state
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoImageId, setLogoImageId] = useState(null);
  const logoFileInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(storeInfoSchema),
    defaultValues: {
      name: '',
      legalName: '',
      taxId: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  // API orqali store ma'lumotlarini olish
  useEffect(() => {
    const fetchStoreData = async () => {
      // Token mavjudligini tekshirish
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        // Token yo'q bo'lsa, localStorage'dan olish
        try {
          const storeDataStr = localStorage.getItem('storeData');
          if (storeDataStr) {
            const cachedStoreData = JSON.parse(storeDataStr);
            setStoreData(cachedStoreData);
            const formData = {
              name: cachedStoreData.name || '',
              legalName: cachedStoreData.legalName || '',
              taxId: cachedStoreData.taxId || '',
              phone: cachedStoreData.phoneNumber || '',
              email: cachedStoreData.email || '',
              address: cachedStoreData.addressName || cachedStoreData.address || '',
            };
            form.reset(formData);
            if (formData.address) {
              setMapAddress(formData.address);
            }
          }
        } catch (parseError) {
          console.error('Error parsing cached store data:', parseError);
        }
        return;
      }

      // Kichik kechikish - login qilgandan keyin token to'g'ri ishlashini kutish
      await new Promise(resolve => setTimeout(resolve, 200));

      setIsLoading(true);
      try {
        const response = await api.get('/store/get');
        const fetchedStoreData = response?.data || response;

        if (fetchedStoreData) {
          setStoreData(fetchedStoreData);
          const formData = {
            name: fetchedStoreData.name || '',
            legalName: fetchedStoreData.legalName || '',
            taxId: fetchedStoreData.taxId || '',
            phone: fetchedStoreData.phoneNumber || '',
            email: fetchedStoreData.email || '',
            address: fetchedStoreData.addressName || fetchedStoreData.address || '',
          };

          form.reset(formData);
          if (formData.address) {
            setMapAddress(formData.address);
          }

          // Merge with existing localStorage data to preserve logo if backend doesn't return it
          try {
            const existingStoreDataStr = localStorage.getItem('storeData');
            if (existingStoreDataStr) {
              const existingStoreData = JSON.parse(existingStoreDataStr);
              // If backend data doesn't have logo but localStorage does, preserve it
              if (!fetchedStoreData.logo && existingStoreData.logo) {
                fetchedStoreData.logo = existingStoreData.logo;
              }
            }
          } catch (e) {
            console.error('Error merging store data:', e);
          }

          // Load logo preview
          if (fetchedStoreData.logo?.url) {
            const logoUrl = formatImageUrl(fetchedStoreData.logo.url);
            setLogoPreview(logoUrl);
            setLogoImageId(fetchedStoreData.logo._id || fetchedStoreData.logoId);
          } else if (fetchedStoreData.logoId) {
            setLogoImageId(fetchedStoreData.logoId);
          } else {
            setLogoPreview(null);
            setLogoImageId(null);
          }

          // localStorage'ga ham saqlash (cache uchun)
          localStorage.setItem('storeData', JSON.stringify(fetchedStoreData));

          // Trigger localStorage change event
          window.dispatchEvent(new Event('localStorageChange'));
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
        toast.error('Do\'kon ma\'lumotlarini yuklashda xatolik yuz berdi');

        // Agar API xato bersa, localStorage'dan olish
        try {
          const storeDataStr = localStorage.getItem('storeData');
          if (storeDataStr) {
            const cachedStoreData = JSON.parse(storeDataStr);
            setStoreData(cachedStoreData);
            const formData = {
              name: cachedStoreData.name || '',
              legalName: cachedStoreData.legalName || '',
              taxId: cachedStoreData.taxId || '',
              phone: cachedStoreData.phoneNumber || '',
              email: cachedStoreData.email || '',
              address: cachedStoreData.addressName || cachedStoreData.address || '',
            };
            form.reset(formData);
            if (formData.address) {
              setMapAddress(formData.address);
            }

            // Load logo preview
            if (cachedStoreData.logo?.url) {
              const logoUrl = formatImageUrl(cachedStoreData.logo.url);
              setLogoPreview(logoUrl);
              setLogoImageId(cachedStoreData.logo._id || cachedStoreData.logoId);
            } else if (cachedStoreData.logoId) {
              setLogoImageId(cachedStoreData.logoId);
            } else {
              setLogoPreview(null);
              setLogoImageId(null);
            }
          }
        } catch (parseError) {
          console.error('Error parsing cached store data:', parseError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [form]);

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
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    setLogoImageId(null);
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // StoreData ni localStorage'dan olish agar state'da bo'lmasa
      let currentStoreData = storeData;
      if (!currentStoreData) {
        try {
          const storeDataStr = localStorage.getItem('storeData');
          if (storeDataStr) {
            currentStoreData = JSON.parse(storeDataStr);
          }
        } catch (error) {
          console.error('Error getting storeData from localStorage:', error);
        }
      }

      if (!currentStoreData?._id) {
        toast.error('Do\'kon ma\'lumotlari topilmadi. Iltimos, sahifani yangilang');
        setIsSubmitting(false);
        return;
      }

      let finalLogoId = logoImageId;
      let uploadedImageData = null;

      // Upload logo if new file is selected
      if (logoFile) {
        try {
          const resizedFile = await resizeImage(logoFile, 800, 800);
          const formData = new FormData();
          formData.append('file', resizedFile);
          const uploadResponse = await api.post('/image/upload', formData);
          uploadedImageData = uploadResponse?.data || uploadResponse;

          if (uploadedImageData?._id) {
            finalLogoId = uploadedImageData._id;
            setLogoImageId(uploadedImageData._id);
            setLogoFile(null);

            // Update preview with server URL
            if (uploadedImageData.url) {
              const serverImageUrl = formatImageUrl(uploadedImageData.url);
              if (serverImageUrl) {
                setLogoPreview(serverImageUrl);
              }
            }
          } else {
            throw new Error('Rasm yuklashda xatolik - image ID olinmadi');
          }
        } catch (error) {
          console.error('Error uploading logo:', error);
          toast.error('Logo yuklashda xatolik yuz berdi');
          setIsSubmitting(false);
          return;
        }
      }

      // API'ga so'rov yuborish
      const updateData = {
        _id: currentStoreData._id,
        name: data.name,
        phoneNumber: data.phone,
        email: data.email || undefined,
        legalName: data.legalName || undefined,
        taxId: data.taxId || undefined,
        addressName: data.address,
        ...(finalLogoId && { logoId: finalLogoId }),
      };

      const response = await api.put('/store/update', updateData);

      // Muvaffaqiyatli saqlangan ma'lumotlarni localStorage'ga yangilash
      try {
        const updatedStoreData = {
          ...currentStoreData,
          ...updateData,
          // phoneNumber va addressName'ni ham to'g'ri saqlash
          phoneNumber: data.phone,
          addressName: data.address,
        };

        // Update logo if uploaded
        if (finalLogoId && uploadedImageData) {
          const logoUrl = uploadedImageData.url || null;
          updatedStoreData.logoId = finalLogoId;
          updatedStoreData.logo = logoUrl ? {
            _id: finalLogoId,
            url: logoUrl,
          } : {
            _id: finalLogoId,
          };
        }

        setStoreData(updatedStoreData);
        localStorage.setItem('storeData', JSON.stringify(updatedStoreData));
        // Trigger localStorage change event
        window.dispatchEvent(new Event('localStorageChange'));
      } catch (parseError) {
        console.error('Error updating localStorage:', parseError);
      }

      toast.success('Do\'kon ma\'lumotlari saqlandi');
    } catch (error) {
      console.error('Error saving store info:', error);
      const errorMessage = error?.message || error?.data?.message || 'Ma\'lumotlarni saqlashda xatolik yuz berdi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressChange = (value) => {
    form.setValue('address', value);
    setMapAddress(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        {/* Logo Upload */}
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Do'kon logosi</Label>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 border border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {logoPreview ? (
                <>
                  <img
                    src={logoPreview}
                    alt="Store logo"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-1 right-1 p-1 bg-background/80 border border-border rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                ref={logoFileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleLogoUpload(file);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => logoFileInputRef.current?.click()}
                className="text-xs"
              >
                <Upload className="w-3 h-3 mr-2" />
                {logoPreview ? 'O\'zgartirish' : 'Rasm yuklash'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG yoki WebP (maks. 5MB)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label required className="text-xs sm:text-sm">
              Do'kon nomi
            </Label>
            <Input
              {...form.register('name')}
              placeholder="Do'kon nomi"
              className="text-sm sm:text-base"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label optional className="text-xs sm:text-sm">
              Yuridik nomi
            </Label>
            <Input
              {...form.register('legalName')}
              placeholder="Yuridik nomi"
              className="text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label optional className="text-xs sm:text-sm">
              Soliq ID (INN)
            </Label>
            <Input
              {...form.register('taxId')}
              placeholder="123456789"
              className="text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label required className="text-xs sm:text-sm">
              Telefon raqami
            </Label>
            <Input
              {...form.register('phone')}
              placeholder="+998901234567"
              type="tel"
              className="text-sm sm:text-base"
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-destructive">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label optional className="text-xs sm:text-sm">
            Email
          </Label>
          <Input
            {...form.register('email')}
            placeholder="info@example.com"
            type="email"
            className="text-sm sm:text-base"
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label required className="text-xs sm:text-sm">
            Manzil
          </Label>
          <Textarea
            {...form.register('address')}
            placeholder="To'liq manzil"
            className="text-sm sm:text-base min-h-[80px]"
            onChange={(e) => handleAddressChange(e.target.value)}
          />
          {form.formState.errors.address && (
            <p className="text-xs text-destructive">
              {form.formState.errors.address.message}
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
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            // Form'ni default qiymatlarga qaytarish
            form.reset({
              name: '',
              legalName: '',
              taxId: '',
              phone: '',
              email: '',
              address: '',
            });
            setMapAddress('');
          }}
          className="text-xs sm:text-sm"
        >
          Bekor qilish
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="text-xs sm:text-sm"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Saqlash
        </Button>
      </div>
    </form>
  );
}

export default StoreInfo;

