import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const [mapAddress, setMapAddress] = useState('');

  // Mock initial data
  const defaultValues = {
    name: 'Uygaayt Restoran',
    legalName: 'Uygaayt MChJ',
    taxId: '123456789',
    phone: '+998901234567',
    email: 'info@uygaayt.uz',
    address: 'Toshkent shahar, Yunusobod tumani, Amir Temur ko\'chasi, 15-uy',
  };

  const form = useForm({
    resolver: zodResolver(storeInfoSchema),
    defaultValues,
  });

  React.useEffect(() => {
    setMapAddress(defaultValues.address);
  }, []);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Store info saved:', data);
      toast.success('Do\'kon ma\'lumotlari saqlandi');
    } catch (error) {
      console.error('Error saving store info:', error);
      toast.error('Ma\'lumotlarni saqlashda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressChange = (value) => {
    form.setValue('address', value);
    setMapAddress(value);
  };

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
          onClick={() => form.reset(defaultValues)}
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

