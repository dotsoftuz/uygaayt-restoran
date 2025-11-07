import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Clock, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const storeInfoSchema = z.object({
  name: z.string().min(1, 'Do\'kon nomi majburiy'),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  phone: z.string().min(1, 'Telefon raqami majburiy'),
  email: z.string().email('Noto\'g\'ri email formati').optional().or(z.literal('')),
  address: z.string().min(1, 'Manzil majburiy'),
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

const TIMEZONES = [
  { value: 'Asia/Tashkent', label: 'Asia/Tashkent (UTC+5)' },
  { value: 'UTC', label: 'UTC (UTC+0)' },
];

function StoreSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapAddress, setMapAddress] = useState('');
  const [timezone, setTimezone] = useState('Asia/Tashkent');
  const [businessHours, setBusinessHours] = useState({
    monday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    tuesday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    wednesday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    thursday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    friday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    saturday: { enabled: true, intervals: [{ start: '10:00', end: '16:00' }] },
    sunday: { enabled: false, intervals: [{ start: '10:00', end: '16:00' }] },
  });

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

  const handleDayToggle = (day) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }));
  };

  const handleAddInterval = (day) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        intervals: [...prev[day].intervals, { start: '09:00', end: '18:00' }],
      },
    }));
  };

  const handleRemoveInterval = (day, index) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        intervals: prev[day].intervals.filter((_, i) => i !== index),
      },
    }));
  };

  const handleIntervalChange = (day, index, field, value) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        intervals: prev[day].intervals.map((interval, i) =>
          i === index ? { ...interval, [field]: value } : interval
        ),
      },
    }));
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Store settings saved:', { ...data, businessHours, timezone });
      toast.success('Do\'kon sozlamalari saqlandi');
    } catch (error) {
      console.error('Error saving store settings:', error);
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
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 sm:space-y-8">
      {/* Store Info Section */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold">Do'kon ma'lumotlari</h3>
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

      <Separator />

      {/* Business Hours Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <h3 className="text-base sm:text-lg font-semibold">Ish vaqti</h3>
        </div>

        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Vaqt mintaqasi</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {DAYS.map((day) => (
            <div
              key={day.value}
              className="border rounded-lg p-3 sm:p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={businessHours[day.value].enabled}
                    onCheckedChange={() => handleDayToggle(day.value)}
                  />
                  <Label className="text-sm sm:text-base font-medium">
                    {day.label}
                  </Label>
                </div>
                {businessHours[day.value].enabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddInterval(day.value)}
                    className="text-xs sm:text-sm"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Qo'shish</span>
                  </Button>
                )}
              </div>

              {businessHours[day.value].enabled && (
                <div className="space-y-2 pl-8">
                  {businessHours[day.value].intervals.map((interval, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 flex-wrap"
                    >
                      <Input
                        type="time"
                        value={interval.start}
                        onChange={(e) =>
                          handleIntervalChange(day.value, index, 'start', e.target.value)
                        }
                        className="w-full sm:w-[140px] text-xs sm:text-sm"
                      />
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        dan
                      </span>
                      <Input
                        type="time"
                        value={interval.end}
                        onChange={(e) =>
                          handleIntervalChange(day.value, index, 'end', e.target.value)
                        }
                        className="w-full sm:w-[140px] text-xs sm:text-sm"
                      />
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        gacha
                      </span>
                      {businessHours[day.value].intervals.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveInterval(day.value, index)}
                          className="h-8 w-8"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            form.reset(defaultValues);
            setMapAddress(defaultValues.address);
            setBusinessHours({
              monday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
              tuesday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
              wednesday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
              thursday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
              friday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
              saturday: { enabled: true, intervals: [{ start: '10:00', end: '16:00' }] },
              sunday: { enabled: false, intervals: [{ start: '10:00', end: '16:00' }] },
            });
            setTimezone('Asia/Tashkent');
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

export default StoreSettings;

