import React, { useEffect } from 'react';
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
const DiscountAmountTypeEnum = {
  AMOUNT: 'amount',
  PERCENT: 'percent',
};

const productSchema = z.object({
  nameUz: z.string().min(1, "O'zbekcha nom majburiy"),
  nameRu: z.string().min(1, 'Ruscha nom majburiy'),
  nameEn: z.string().min(1, 'Inglizcha nom majburiy'),
  categoryId: z.string().min(1, 'Kategoriya majburiy'),
  price: z.coerce.number().min(0, 'Narx 0 dan katta bo‘lishi kerak'),
  inStock: z.coerce.number().min(0, 'Ombor miqdori 0 dan kichik bo‘lolmaydi'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  discountEnabled: z.boolean().default(false),
  discountType: z
    .enum([DiscountAmountTypeEnum.AMOUNT, DiscountAmountTypeEnum.PERCENT])
    .default(DiscountAmountTypeEnum.AMOUNT),
  discountValue: z.coerce.number().min(0, 'Chegirma qiymati 0 dan kichik bo‘lolmaydi').optional(),
  discountStartAt: z.string().optional(),
  discountEndAt: z.string().optional(),
  yellowLine: z.coerce.number().min(0).optional(),
  redLine: z.coerce.number().min(0).optional(),
  url: z.string().optional(),
});

const defaultValues = {
  nameUz: '',
  nameRu: '',
  nameEn: '',
  categoryId: '',
  price: 0,
  inStock: 0,
  description: '',
  isActive: true,
  discountEnabled: false,
  discountType: DiscountAmountTypeEnum.AMOUNT,
  discountValue: 0,
  discountStartAt: '',
  discountEndAt: '',
  yellowLine: '',
  redLine: '',
  url: '',
};

const StoreProductForm = ({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  initialData = null,
  categories = [],
}) => {
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        nameUz: initialData?.nameTranslate?.uz ?? initialData?.name ?? '',
        nameRu: initialData?.nameTranslate?.ru ?? initialData?.name ?? '',
        nameEn: initialData?.nameTranslate?.en ?? initialData?.name ?? '',
        categoryId: initialData?.categoryId ?? '',
        price: initialData?.price ?? 0,
        inStock: initialData?.inStock ?? 0,
        description: initialData?.description ?? '',
        isActive: initialData?.isActive ?? true,
        discountEnabled: initialData?.discountEnabled ?? false,
        discountType: initialData?.discountType ?? DiscountAmountTypeEnum.AMOUNT,
        discountValue: initialData?.discountValue ?? 0,
        discountStartAt: initialData?.discountStartAt
          ? new Date(initialData.discountStartAt).toISOString().slice(0, 16)
          : '',
        discountEndAt: initialData?.discountEndAt
          ? new Date(initialData.discountEndAt).toISOString().slice(0, 16)
          : '',
        yellowLine: initialData?.yellowLine ?? '',
        redLine: initialData?.redLine ?? '',
        url: initialData?.url ?? '',
      });
    } else if (!initialData && open) {
      form.reset(defaultValues);
    }
  }, [initialData, open, form]);

  const handleSubmit = async (values) => {
    const payload = {
      name: {
        uz: values.nameUz,
        ru: values.nameRu,
        en: values.nameEn,
      },
      categoryId: values.categoryId,
      price: values.price,
      inStock: values.inStock,
      description: values.description || undefined,
      isActive: values.isActive,
      discountEnabled: values.discountEnabled,
      discountType: values.discountEnabled ? values.discountType : DiscountAmountTypeEnum.AMOUNT,
      discountValue: values.discountEnabled ? values.discountValue ?? 0 : 0,
      discountStartAt: values.discountEnabled && values.discountStartAt ? new Date(values.discountStartAt) : undefined,
      discountEndAt: values.discountEnabled && values.discountEndAt ? new Date(values.discountEndAt) : undefined,
      yellowLine: values.yellowLine === '' ? undefined : values.yellowLine,
      redLine: values.redLine === '' ? undefined : values.redLine,
      url: values.url || undefined,
    };

    if (initialData?._id) {
      payload._id = initialData._id;
    }

    await onSubmit(payload);
    onOpenChange(false);
  };

  const renderCategorySelect = () => {
    if (categories.length === 0) {
      return (
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Kategoriya ID</FormLabel>
              <FormControl>
                <Input placeholder="Kategoriya ID (ObjectId)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    return (
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Kategoriya</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Kategoriya tanlang" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-3xl overflow-y-auto border-l">
        <SheetHeader className="pb-4">
          <SheetTitle>{initialData ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</SheetTitle>
          <SheetDescription>
            Mahsulot ma'lumotlarini to'ldiring va saqlashdan oldin ko'rib chiqing.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="nameUz"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Nomi (UZ)</FormLabel>
                    <FormControl>
                      <Input placeholder="Uzbekcha nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameRu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Nomi (RU)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ruscha nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Nomi (EN)</FormLabel>
                    <FormControl>
                      <Input placeholder="Inglizcha nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {renderCategorySelect()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Narx (so&apos;m)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Ombordagi miqdor</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel optional>Tavsif</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mahsulot haqida qisqacha ma'lumot" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="yellowLine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>Sariq chiziq (threshold)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="redLine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>Qizil chiziq (threshold)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel optional>URL (slug)</FormLabel>
                  <FormControl>
                    <Input placeholder="Masalan: qozon-kabob" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <FormLabel optional>Chegirma</FormLabel>
                <FormField
                  control={form.control}
                  name="discountEnabled"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>

              {form.watch('discountEnabled') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chegirma turi</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                    <SelectItem value={DiscountAmountTypeEnum.AMOUNT}>Summaga (so&apos;m)</SelectItem>
                    <SelectItem value={DiscountAmountTypeEnum.PERCENT}>Foizda (%)</SelectItem>
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
                        <FormLabel>Chegirma qiymati</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discountStartAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chegirma boshlanishi</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discountEndAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chegirma tugashi</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Holati</FormLabel>
                    <span className="text-sm text-muted-foreground">
                      Faol mahsulotlar mijozlarga ko&apos;rinadi
                    </span>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <SheetFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={loading}>
                {initialData ? 'Yangilash' : 'Yaratish'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default StoreProductForm;

