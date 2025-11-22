import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Loader2, CalendarIcon, Percent, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { NumericFormat } from 'react-number-format';

const promotionSchema = z.object({
  code: z.string().min(1, 'Promo kod majburiy').max(50, 'Promo kod juda uzun'),
  type: z.enum(['percentage', 'fixed', 'product'], {
    required_error: 'Chegirma turini tanlang',
  }),
  discountValue: z.number({ required_error: 'Chegirma qiymati majburiy', invalid_type_error: 'Chegirma qiymati raqam bo\'lishi kerak' }).min(0.01, 'Chegirma qiymati 0 dan katta bo\'lishi kerak'),
  discountType: z.enum(['code', 'product']).default('code'),
  minOrderValue: z.number().min(0).optional().nullable(),
  validFrom: z.date({
    required_error: 'Boshlanish sanasi majburiy',
  }),
  validUntil: z.date({
    required_error: 'Tugash sanasi majburiy',
  }),
  firstOrderOnly: z.boolean().default(false),
  usageLimitPerUser: z.number().min(1).optional().nullable(),
  usageLimitTotal: z.number().min(1).optional().nullable(),
  description: z.string().optional(),
  productIds: z.array(z.string()).optional().default([]),
}).refine((data) => {
  if (data.validUntil <= data.validFrom) {
    return false;
  }
  return true;
}, {
  message: 'Tugash sanasi boshlanish sanasidan keyin bo\'lishi kerak',
  path: ['validUntil'],
}).refine((data) => {
  if (data.type === 'percentage' && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: 'Foiz chegirma 100% dan oshmasligi kerak',
  path: ['discountValue'],
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

  const form = useForm({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      code: '',
      type: 'fixed', // 'percentage' o'rniga 'fixed'
      discountValue: undefined,
      discountType: 'code',
      minOrderValue: null,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      firstOrderOnly: false,
      usageLimitPerUser: null,
      usageLimitTotal: null,
      description: '',
      productIds: [],
    },
  });

  // Reset form when sheet opens/closes or promotion changes
  React.useEffect(() => {
    if (!open) {
      // Sheet yopilganda formni to'liq reset qilish
      form.reset({
        code: '',
        type: 'fixed',
        discountValue: undefined,
        discountType: 'code',
        minOrderValue: null,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        firstOrderOnly: false,
        usageLimitPerUser: null,
        usageLimitTotal: null,
        description: '',
        productIds: [],
      });
      return;
    }

    // Sheet ochilganda
    if (promotion && open) {
      // Edit mode - promotion ma'lumotlarini yuklash
      form.reset({
        code: promotion.code || '',
        type: promotion.type || 'fixed',
        discountValue: promotion.discountValue ?? undefined,
        discountType: promotion.discountType || 'code',
        minOrderValue: promotion.minOrderValue || null,
        validFrom: promotion.validFrom ? new Date(promotion.validFrom) : new Date(),
        validUntil: promotion.validUntil ? new Date(promotion.validUntil) : new Date(),
        firstOrderOnly: promotion.firstOrderOnly || false,
        usageLimitPerUser: promotion.usageLimitPerUser || null,
        usageLimitTotal: promotion.usageLimitTotal || null,
        description: promotion.description || '',
        productIds: promotion.productIds || [],
      });
    } else if (!promotion && open) {
      // New mode - formni to'liq reset qilish va yangi kod generatsiya qilish
      form.reset({
        code: '',
        type: 'fixed',
        discountValue: undefined,
        discountType: 'code',
        minOrderValue: null,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        firstOrderOnly: false,
        usageLimitPerUser: null,
        usageLimitTotal: null,
        description: '',
        productIds: [],
      });
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
      await onSave(data);
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
        code: '',
        type: 'fixed',
        discountValue: undefined,
        discountType: 'code',
        minOrderValue: null,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        firstOrderOnly: false,
        usageLimitPerUser: null,
        usageLimitTotal: null,
        description: '',
        productIds: [],
      });
    }
    onOpenChange(isOpen);
  };

  const discountType = form.watch('type');
  const discountValue = form.watch('discountValue');

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {promotion ? 'Promo kodni tahrirlash' : 'Yangi promo kod'}
          </SheetTitle>
          <SheetDescription>
            Promo kod yoki mahsulot darajasidagi chegirma yarating
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Asosiy</TabsTrigger>
                <TabsTrigger value="conditions">Shartlar</TabsTrigger>
                <TabsTrigger value="limits">Cheklovlar</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Chegirma turi</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="code" id="code" />
                            <Label htmlFor="code" className="font-normal cursor-pointer">
                              Promo kod (buyurtma uchun)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="product" id="product" />
                            <Label htmlFor="product" className="font-normal cursor-pointer">
                              Mahsulot darajasidagi chegirma
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Chegirma formati</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chegirma turini tanlang" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">
                            <div className="flex items-center gap-2">
                              <Percent className="h-4 w-4" />
                              Foiz (%)
                            </div>
                          </SelectItem>
                          <SelectItem value="fixed">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Belgilangan summa
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>
                        {discountType === 'percentage' ? 'Chegirma foizi' : 'Chegirma summasi'}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          {discountType === 'percentage' ? (
                            <NumericFormat
                              customInput={Input}
                              suffix="%"
                              placeholder="Masalan: 10"
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
                              decimalScale={2}
                              max={100}
                              className="pr-8"
                            />
                          ) : (
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
                          )}
                          {discountType === 'fixed' && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                              so'm
                            </span>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        {discountType === 'percentage'
                          ? 'Maksimal 100%'
                          : 'Belgilangan summa miqdori'}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Conditions Tab */}
              <TabsContent value="conditions" className="space-y-4">
                <FormField
                  control={form.control}
                  name="minOrderValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>Minimal buyurtma summasi</FormLabel>
                      <FormControl>
                        <NumericFormat
                          customInput={Input}
                          thousandSeparator=" "
                          placeholder="Masalan: 50 000"
                          value={field.value === undefined || field.value === null ? '' : field.value}
                          onValueChange={(values) => {
                            const { floatValue } = values;
                            if (floatValue === undefined || floatValue === null) {
                              field.onChange(null);
                            } else {
                              field.onChange(floatValue);
                            }
                          }}
                          onBlur={field.onBlur}
                          allowNegative={false}
                        />
                      </FormControl>
                      <FormDescription>
                        Agar belgilansa, faqat shu summadan yuqori buyurtmalar uchun ishlaydi
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

                <FormField
                  control={form.control}
                  name="firstOrderOnly"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Faqat birinchi buyurtma</FormLabel>
                        <FormDescription>
                          Faqat yangi mijozlar uchun promo kod
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
              </TabsContent>

              {/* Limits Tab */}
              <TabsContent value="limits" className="space-y-4">
                <FormField
                  control={form.control}
                  name="usageLimitPerUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>Har bir foydalanuvchi uchun cheklov</FormLabel>
                      <FormControl>
                        <NumericFormat
                          customInput={Input}
                          thousandSeparator=" "
                          placeholder="Masalan: 5"
                          value={field.value === undefined || field.value === null ? '' : field.value}
                          onValueChange={(values) => {
                            const { floatValue } = values;
                            if (floatValue === undefined || floatValue === null) {
                              field.onChange(null);
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
                        Har bir foydalanuvchi necha marta ishlatishi mumkin (bo'sh qoldirilsa, cheklov yo'q)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usageLimitTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>Umumiy ishlatish cheklovi</FormLabel>
                      <FormControl>
                        <NumericFormat
                          customInput={Input}
                          thousandSeparator=" "
                          placeholder="Masalan: 100"
                          value={field.value === undefined || field.value === null ? '' : field.value}
                          onValueChange={(values) => {
                            const { floatValue } = values;
                            if (floatValue === undefined || floatValue === null) {
                              field.onChange(null);
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
                        Jami necha marta ishlatilishi mumkin (bo'sh qoldirilsa, cheklov yo'q)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
