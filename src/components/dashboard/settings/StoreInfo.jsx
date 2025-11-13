import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

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
            const storeData = JSON.parse(storeDataStr);
            const formData = {
              name: storeData.name || '',
              legalName: storeData.legalName || '',
              taxId: storeData.taxId || '',
              phone: storeData.phoneNumber || '',
              email: storeData.email || '',
              address: storeData.addressName || storeData.address || '',
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
        const storeData = response?.data || response;
        
        if (storeData) {
          const formData = {
            name: storeData.name || '',
            legalName: storeData.legalName || '',
            taxId: storeData.taxId || '',
            phone: storeData.phoneNumber || '',
            email: storeData.email || '',
            address: storeData.addressName || storeData.address || '',
          };
          
          form.reset(formData);
          if (formData.address) {
            setMapAddress(formData.address);
          }
          
          // localStorage'ga ham saqlash (cache uchun)
          localStorage.setItem('storeData', JSON.stringify(storeData));
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
        toast.error('Do\'kon ma\'lumotlarini yuklashda xatolik yuz berdi');
        
        // Agar API xato bersa, localStorage'dan olish
        try {
          const storeDataStr = localStorage.getItem('storeData');
          if (storeDataStr) {
            const storeData = JSON.parse(storeDataStr);
            const formData = {
              name: storeData.name || '',
              legalName: storeData.legalName || '',
              taxId: storeData.taxId || '',
              phone: storeData.phoneNumber || '',
              email: storeData.email || '',
              address: storeData.addressName || storeData.address || '',
            };
            form.reset(formData);
            if (formData.address) {
              setMapAddress(formData.address);
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

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // API'ga so'rov yuborish
      const updateData = {
        name: data.name,
        phoneNumber: data.phone,
        email: data.email || undefined,
        legalName: data.legalName || undefined,
        taxId: data.taxId || undefined,
        addressName: data.address,
      };

      const response = await api.patch('/store/update', updateData);
      
      // Muvaffaqiyatli saqlangan ma'lumotlarni localStorage'ga yangilash
      try {
        const storeDataStr = localStorage.getItem('storeData');
        if (storeDataStr) {
          const storeData = JSON.parse(storeDataStr);
          const updatedData = {
            ...storeData,
            ...updateData,
            // phoneNumber va addressName'ni ham to'g'ri saqlash
            phoneNumber: data.phone,
            addressName: data.address,
          };
          localStorage.setItem('storeData', JSON.stringify(updatedData));
        }
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

