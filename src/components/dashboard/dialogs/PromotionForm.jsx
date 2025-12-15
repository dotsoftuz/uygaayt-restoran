import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Loader2, CalendarIcon, Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { NumericFormat } from 'react-number-format';
import api from '@/services/api';
import { uploadImage } from '@/services/storeProducts';

// Helper function to resize image
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

const promotionSchema = z.object({
  name: z.string().min(1, 'Promokod nomi majburiy').max(100, 'Promokod nomi juda uzun'),
  code: z.string().min(1, 'Promo kod majburiy').max(50, 'Promo kod juda uzun'),
  discountValue: z.number({ required_error: 'Chegirma qiymati majburiy', invalid_type_error: 'Chegirma qiymati raqam bo\'lishi kerak' }).min(0.01, 'Chegirma qiymati 0 dan katta bo\'lishi kerak'),
  minOrderValue: z.number({ required_error: 'Minimal buyurtma summasi majburiy', invalid_type_error: 'Minimal buyurtma summasi raqam bo\'lishi kerak' }).min(0, 'Minimal buyurtma summasi 0 dan katta yoki teng bo\'lishi kerak'),
  validFrom: z.date({
    required_error: 'Boshlanish sanasi majburiy',
  }),
  validUntil: z.date({
    required_error: 'Tugash sanasi majburiy',
  }),
  usageLimitPerUser: z.number({ required_error: 'Foydalanuvchi uchun maksimal foydalanish majburiy', invalid_type_error: 'Foydalanuvchi uchun maksimal foydalanish raqam bo\'lishi kerak' }).min(1, 'Foydalanuvchi uchun maksimal foydalanish 1 dan katta bo\'lishi kerak'),
  usageLimitTotal: z.number({ required_error: 'Qancha ishlatilishi majburiy', invalid_type_error: 'Qancha ishlatilishi raqam bo\'lishi kerak' }).min(1, 'Qancha ishlatilishi 1 dan katta bo\'lishi kerak'),
  description: z.string().optional(),
  productIds: z.array(z.string()).optional().default([]),
  bannerImageId: z.string().optional().nullable(),
  isShow: z.boolean().optional().default(false),
}).refine((data) => {
  if (data.validUntil <= data.validFrom) {
    return false;
  }
  return true;
}, {
  message: 'Tugash sanasi boshlanish sanasidan keyin bo\'lishi kerak',
  path: ['validUntil'],
});

// Helper function to generate random promo code
const generatePromoCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

function PromotionForm({ open, onOpenChange, promotion = null, onSave }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerImageId, setBannerImageId] = useState(null);
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const bannerFileInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: '',
      code: '',
      discountValue: undefined,
      minOrderValue: 0,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      usageLimitPerUser: 1,
      usageLimitTotal: 1,
      description: '',
      productIds: [],
      bannerImageId: null,
      isShow: false,
    },
  });

  // Handle banner image upload
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
  };

  const handleRemoveBanner = () => {
    setBannerPreview(null);
    setBannerFile(null);
    setBannerImageId(null);
    form.setValue('bannerImageId', null);
  };

  // Reset form when sheet opens/closes or promotion changes
  React.useEffect(() => {
    if (!open) {
      // Sheet yopilganda formni to'liq reset qilish
      form.reset({
        name: '',
        code: '',
        discountValue: undefined,
        minOrderValue: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimitPerUser: 1,
        usageLimitTotal: 1,
        description: '',
        productIds: [],
        bannerImageId: null,
        isShow: false,
      });
      setBannerPreview(null);
      setBannerFile(null);
      setBannerImageId(null);
      return;
    }

    // Sheet ochilganda
    if (promotion && open) {
      // Edit mode - promotion ma'lumotlarini yuklash
      const bannerId = promotion.bannerImageId || promotion.bannerImage?._id || null;
      form.reset({
        name: promotion.name || '',
        code: promotion.code || '',
        discountValue: promotion.discountValue ?? undefined,
        minOrderValue: promotion.minOrderValue ?? 0,
        validFrom: promotion.validFrom ? new Date(promotion.validFrom) : new Date(),
        validUntil: promotion.validUntil ? new Date(promotion.validUntil) : new Date(),
        usageLimitPerUser: promotion.usageLimitPerUser ?? 1,
        usageLimitTotal: promotion.usageLimitTotal ?? 1,
        description: promotion.description || '',
        productIds: promotion.productIds || [],
        bannerImageId: bannerId,
        isShow: promotion.isShow ?? false,
      });

      // Set banner preview if exists
      if (promotion.bannerImage?.url) {
        const bannerUrl = formatImageUrl(promotion.bannerImage.url);
        setBannerPreview(bannerUrl);
        setBannerImageId(bannerId);
      } else if (bannerId) {
        // If we have bannerImageId but no image object, we'll need to fetch it
        // For now, just set the ID
        setBannerImageId(bannerId);
      }
    } else if (!promotion && open) {
      // New mode - formni to'liq reset qilish va yangi kod generatsiya qilish
      form.reset({
        name: '',
        code: '',
        discountValue: undefined,
        minOrderValue: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimitPerUser: 1,
        usageLimitTotal: 1,
        description: '',
        productIds: [],
        bannerImageId: null,
        isShow: false,
      });
      setBannerPreview(null);
      setBannerFile(null);
      setBannerImageId(null);
      // Generate random code for new promotions
      form.setValue('code', generatePromoCode());
    }
  }, [promotion, open, form]);

  const handleGenerateCode = () => {
    form.setValue('code', generatePromoCode());
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Upload banner image if new file is selected
      let finalBannerImageId = bannerImageId || data.bannerImageId;

      if (bannerFile) {
        try {
          setIsBannerUploading(true);
          const resizedFile = await resizeImage(bannerFile, 1920, 1080);
          const uploadResponse = await uploadImage(resizedFile);
          const uploadedBannerData = uploadResponse?.data || uploadResponse;

          if (uploadedBannerData?._id) {
            finalBannerImageId = uploadedBannerData._id;
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
            throw new Error('Banner rasm yuklashda xatolik - image ID olinmadi');
          }
          setIsBannerUploading(false);
        } catch (error) {
          console.error('Error uploading banner:', error);
          toast.error('Banner rasm yuklashda xatolik yuz berdi');
          setIsSubmitting(false);
          setIsBannerUploading(false);
          return;
        }
      }

      // Include bannerImageId in data
      const dataWithBanner = {
        ...data,
        bannerImageId: finalBannerImageId,
      };

      await onSave(dataWithBanner);
      // Don't close here - let parent component handle it
      // Also don't show toast here - parent component handles it
      // Form reset parent component tomonidan boshqariladi (sheet yopilganda)
    } catch (error) {
      console.error('Error saving promotion:', error);
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle sheet close - reset form
  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      // Sheet yopilganda formni to'liq reset qilish
      form.reset({
        name: '',
        code: '',
        discountValue: undefined,
        minOrderValue: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimitPerUser: 1,
        usageLimitTotal: 1,
        description: '',
        productIds: [],
        bannerImageId: null,
      });
    }
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {promotion ? 'Promo kodni tahrirlash' : 'Yangi promo kod'}
          </SheetTitle>
          <SheetDescription>
            Promo kod yarating
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            <div className="space-y-4">
              {/* 1. Promokod nomi (Required) */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Promokod nomi</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masalan: Yangi yil chegirmasi"
                        {...field}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormDescription>
                      Promokodning nomi yoki sarlavhasi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 2. Promo kod (Required) */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Promo kod</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="WELCOME10"
                          {...field}
                          className="flex-1 font-mono uppercase"
                          maxLength={50}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGenerateCode}
                          className="flex-shrink-0"
                        >
                          Tasodifiy
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Mijozlar buyurtma berishda ishlatadigan kod
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 3. Chegirma summasi (Required) */}
              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Chegirma summasi</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <NumericFormat
                          customInput={Input}
                          thousandSeparator=" "
                          placeholder="Masalan: 5 000"
                          value={field.value === undefined || field.value === null ? '' : field.value}
                          onValueChange={(values) => {
                            const { floatValue } = values;
                            if (floatValue === undefined || floatValue === null) {
                              field.onChange(undefined);
                            } else {
                              field.onChange(floatValue);
                            }
                          }}
                          onBlur={field.onBlur}
                          allowNegative={false}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          so'm
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Belgilangan summa miqdori
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Banner Image Upload */}
              <FormField
                control={form.control}
                name="bannerImageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>Banner rasm</FormLabel>
                    <FormDescription className="mb-2">
                      Tavsiya etilgan o'lcham: 1200x300 px (Aspect ratio: 4:1).
                      Boshqa o'lchamdagi rasmlar avtomatik ravishda moslashtiriladi va kesiladi (object-cover).
                    </FormDescription>
                    <FormControl>
                      <div className="space-y-2">
                        <div
                          className="relative w-full aspect-[4/1] border border-border rounded-lg overflow-hidden cursor-pointer group bg-muted/30 hover:bg-muted/50 transition-colors"
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
                                className="absolute top-2 right-2 p-2 bg-background/95 border border-border rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm z-10"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
                                  O'zgartirish uchun bosing
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center mx-auto mb-2">
                                  <Upload className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Banner rasm yuklash uchun bosing
                                </p>
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
                        {isBannerUploading && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" /> Yuklanmoqda...
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Promokod uchun banner rasm (ixtiyoriy). Rasm yuklash uchun banner ustiga bosing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>Tavsif</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Promo kod haqida qisqa ma'lumot"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Promokod haqida qisqa ma'lumot (ixtiyoriy)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minOrderValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Minimal buyurtma summasi</FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        thousandSeparator=" "
                        placeholder="Masalan: 50 000"
                        value={field.value === undefined || field.value === null ? '' : field.value}
                        onValueChange={(values) => {
                          const { floatValue } = values;
                          if (floatValue === undefined || floatValue === null) {
                            field.onChange(0);
                          } else {
                            field.onChange(floatValue);
                          }
                        }}
                        onBlur={field.onBlur}
                        allowNegative={false}
                      />
                    </FormControl>
                    <FormDescription>
                      Faqat shu summadan yuqori buyurtmalar uchun ishlaydi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel required>Boshlanish sanasi</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Sana tanlang</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel required>Tugash sanasi</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Sana tanlang</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 9. Qancha ishlatilishi - Umumiy cheklov (Required) */}
              <FormField
                control={form.control}
                name="usageLimitTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Qancha ishlatilishi (Umumiy cheklov)</FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        thousandSeparator=" "
                        placeholder="Masalan: 100"
                        value={field.value === undefined || field.value === null ? '' : field.value}
                        onValueChange={(values) => {
                          const { floatValue } = values;
                          if (floatValue === undefined || floatValue === null) {
                            field.onChange(1);
                          } else {
                            field.onChange(Math.floor(floatValue));
                          }
                        }}
                        onBlur={field.onBlur}
                        allowNegative={false}
                        decimalScale={0}
                      />
                    </FormControl>
                    <FormDescription>
                      Promokodning barcha foydalanuvchilar bo'yicha umumiy ishlatilish limiti
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 10. Foydalanuvchi uchun maksimal foydalanish (Required) */}
              <FormField
                control={form.control}
                name="usageLimitPerUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Foydalanuvchi uchun maksimal foydalanish</FormLabel>
                    <FormControl>
                      <NumericFormat
                        customInput={Input}
                        thousandSeparator=" "
                        placeholder="Masalan: 5"
                        value={field.value === undefined || field.value === null ? '' : field.value}
                        onValueChange={(values) => {
                          const { floatValue } = values;
                          if (floatValue === undefined || floatValue === null) {
                            field.onChange(1);
                          } else {
                            field.onChange(Math.floor(floatValue));
                          }
                        }}
                        onBlur={field.onBlur}
                        allowNegative={false}
                        decimalScale={0}
                      />
                    </FormControl>
                    <FormDescription>
                      Bitta foydalanuvchi bu promokodni necha marta ishlatishi mumkinligi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 11. Banner ko'rsatish (isShow) */}
              <FormField
                control={form.control}
                name="isShow"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Banner ko'rsatish</FormLabel>
                      <FormDescription>
                        Mijoz ilovasida banner ko'rinishini boshqarish
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

            </div>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={isSubmitting || isBannerUploading}>
                {(isSubmitting || isBannerUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {promotion ? 'Yangilash' : 'Yaratish'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export default PromotionForm;
