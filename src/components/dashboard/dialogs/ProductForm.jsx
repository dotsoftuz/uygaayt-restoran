import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  uploadImage,
  fetchStoreProducts,
  getStoreProductById,
  fetchCategories,
} from '@/services/storeProducts';
import TextEditor from '@/components/ui/text-editor';
import { DatePicker } from '@/components/ui/date-picker';

// Validation schema
const productSchema = z.object({
  name: z.object({
    uz: z.string().min(1, 'O\'zbekcha nom majburiy'),
    ru: z.string().min(1, 'Ruscha nom majburiy'),
    en: z.string().min(1, 'Inglizcha nom majburiy'),
  }),
  categoryId: z.string().min(1, 'Kategoriya majburiy'),
  price: z.number().min(0, 'Narx 0 dan katta bo\'lishi kerak'),
  inStock: z.number().min(0, 'Ombordagi miqdor 0 dan katta bo\'lishi kerak'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  mainImageId: z.string().optional().nullable(),
  imageIds: z.array(z.string()).default([]),
  discountEnabled: z.boolean().default(false),
  discountType: z.enum(['AMOUNT', 'PERCENT']).optional(),
  discountValue: z.number().min(0).optional(),
  discountStartAt: z.date().optional().nullable(),
  discountEndAt: z.date().optional().nullable(),
  yellowLine: z.number().min(0).optional(),
  redLine: z.number().min(0).optional(),
});

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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
            resolve(new File([blob], file.name, { type: file.type }));
          },
          file.type,
          0.9
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function ProductForm({ open, onOpenChange, product = null, onSave, onRefresh }) {
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [categories, setCategories] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: {
        uz: '',
        ru: '',
        en: '',
      },
      categoryId: '',
      price: 0,
      inStock: 0,
      description: '',
      isActive: true,
      mainImageId: null,
      imageIds: [],
      discountEnabled: false,
      discountType: 'AMOUNT',
      discountValue: 0,
      discountStartAt: null,
      discountEndAt: null,
      yellowLine: 0,
      redLine: 0,
    },
  });

  // Load categories
  useEffect(() => {
    if (open) {
      fetchCategories()
        .then((res) => {
          if (res?.data?.data) {
            setCategories(res.data.data);
          } else if (res?.data && Array.isArray(res.data)) {
            setCategories(res.data);
          }
        })
        .catch(console.error);
    }
  }, [open]);

  // Load product data when editing
  useEffect(() => {
    if (product?._id && open) {
      setLoadingProduct(true);
      getStoreProductById(product._id)
        .then((response) => {
          const productData = response?.data || response;
          if (productData) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
            const cleanBaseUrl = baseUrl.replace('/v1', '');

            // Load images
            const imagePreviewsList = [];
            if (productData.mainImage?.url) {
              imagePreviewsList.push({
                url: `${cleanBaseUrl}/uploads/${productData.mainImage.url}`,
                id: productData.mainImage._id,
                isMain: true,
              });
            }
            if (productData.images && Array.isArray(productData.images)) {
              productData.images.forEach((img) => {
                if (img.url && img._id !== productData.mainImage?._id) {
                  imagePreviewsList.push({
                    url: `${cleanBaseUrl}/uploads/${img.url}`,
                    id: img._id,
                    isMain: false,
                  });
                }
              });
            }

            setImagePreviews(imagePreviewsList);
            const mainIdx = imagePreviewsList.findIndex((img) => img.isMain);
            setMainImageIndex(mainIdx >= 0 ? mainIdx : 0);

      form.reset({
              name: productData.name || { uz: '', ru: '', en: '' },
              categoryId: productData.categoryId || productData.category?._id || '',
              price: productData.price || 0,
              inStock: productData.inStock || 0,
              description: productData.description || '',
              isActive: productData.isActive !== undefined ? productData.isActive : true,
              mainImageId: productData.mainImage?._id || null,
              imageIds: productData.images?.map((img) => img._id) || [],
              discountEnabled: productData.discountEnabled || false,
              discountType: productData.discountType || 'AMOUNT',
              discountValue: productData.discountValue || 0,
              discountStartAt: productData.discountStartAt ? new Date(productData.discountStartAt) : null,
              discountEndAt: productData.discountEndAt ? new Date(productData.discountEndAt) : null,
              yellowLine: productData.yellowLine || 0,
              redLine: productData.redLine || 0,
            });
          }
        })
        .catch((error) => {
          console.error('Error loading product:', error);
          toast.error('Mahsulotni yuklashda xatolik yuz berdi');
        })
        .finally(() => {
          setLoadingProduct(false);
        });
    } else if (!product && open) {
      form.reset({
        name: { uz: '', ru: '', en: '' },
        categoryId: '',
        price: 0,
        inStock: 0,
        description: '',
        isActive: true,
        mainImageId: null,
        imageIds: [],
        discountEnabled: false,
        discountType: 'AMOUNT',
        discountValue: 0,
        discountStartAt: null,
        discountEndAt: null,
        yellowLine: 0,
        redLine: 0,
      });
      setImagePreviews([]);
      setMainImageIndex(0);
    }
  }, [product, open, form]);

  // Image upload handler
  const onDrop = useCallback(async (acceptedFiles) => {
    const files = acceptedFiles.filter((file) => {
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} - fayl hajmi 5MB dan katta`);
        return false;
      }
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} - noto'g'ri fayl formati`);
        return false;
      }
      return true;
    });

    if (files.length === 0) return;

    setUploadingImages(true);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const preview = URL.createObjectURL(file);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 50 }));

        const resizedFile = await resizeImage(file, 1200, 1200);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 75 }));

        const imageData = await uploadImage(resizedFile);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));

        if (imageData?._id) {
          return {
            preview,
            id: imageData._id,
            url: imageData.url,
            isMain: false,
          };
        } else {
          throw new Error('Image upload failed');
        }
      });

      const results = await Promise.all(uploadPromises);
      const newPreviews = [...imagePreviews, ...results];
      setImagePreviews(newPreviews);

      const currentImageIds = form.getValues('imageIds') || [];
      const newImageIds = results.map((r) => r.id);
      form.setValue('imageIds', [...currentImageIds, ...newImageIds]);

      // If no main image, set first as main
      if (!form.getValues('mainImageId') && results.length > 0) {
        form.setValue('mainImageId', results[0].id);
        setMainImageIndex(0);
      }

      toast.success(`${files.length} ta rasm yuklandi`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Rasmlarni yuklashda xatolik yuz berdi');
    } finally {
      setUploadingImages(false);
      setUploadProgress({});
    }
  }, [form, imagePreviews]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: true,
  });

  const removeImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);

    const removedImage = imagePreviews[index];
    const currentImageIds = form.getValues('imageIds') || [];
    const newImageIds = currentImageIds.filter((id) => id !== removedImage?.id);
    form.setValue('imageIds', newImageIds);

    // If removed main image, set new main
    if (removedImage?.id === form.getValues('mainImageId')) {
      if (newPreviews.length > 0) {
        form.setValue('mainImageId', newPreviews[0].id);
        setMainImageIndex(0);
      } else {
        form.setValue('mainImageId', null);
      }
    }

    // Update main image index
    if (index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    } else if (index === mainImageIndex && newPreviews.length > 0) {
      setMainImageIndex(0);
    }
  };

  const setMainImage = (index) => {
    setMainImageIndex(index);
    if (imagePreviews[index]?.id) {
      form.setValue('mainImageId', imagePreviews[index].id);
    }
  };

  const handleSubmit = async (data) => {
    try {
      // Prepare payload
      const payload = {
        name: data.name,
        categoryId: data.categoryId,
        price: data.price,
        inStock: data.inStock,
        description: data.description || undefined,
        isActive: data.isActive,
        mainImageId: data.mainImageId || undefined,
        imageIds: data.imageIds || [],
        yellowLine: data.yellowLine || 0,
        redLine: data.redLine || 0,
      };

      // Add discount data if enabled
      if (data.discountEnabled) {
        payload.discountEnabled = true;
        payload.discountType = data.discountType;
        payload.discountValue = data.discountValue;
        if (data.discountStartAt) {
          payload.discountStartAt = data.discountStartAt.toISOString();
        }
        if (data.discountEndAt) {
          payload.discountEndAt = data.discountEndAt.toISOString();
        }
      } else {
        payload.discountEnabled = false;
      }

      // Add _id if editing
      if (product?._id) {
        payload._id = product._id;
      }

      await onSave(payload);
      form.reset();
      setImagePreviews([]);
      setMainImageIndex(0);
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  };

  const discountEndMinDate = form.watch('discountStartAt')
    ? new Date(form.watch('discountStartAt'))
    : null;
  if (discountEndMinDate) {
    discountEndMinDate.setDate(discountEndMinDate.getDate() + 1);
  }

  const inStock = form.watch('inStock') || 0;
  const yellowLine = form.watch('yellowLine') || 0;
  const redLine = form.watch('redLine') || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {product ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
          </SheetTitle>
          <SheetDescription>
            Mahsulot ma'lumotlarini to'ldiring va saqlang
          </SheetDescription>
        </SheetHeader>

        {loadingProduct ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Asosiy</TabsTrigger>
                  <TabsTrigger value="images">Rasmlar</TabsTrigger>
                  <TabsTrigger value="discount">Chegirma</TabsTrigger>
                  <TabsTrigger value="stock">Ombordagi</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                    name="name.uz"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel required>Nomi (O'zbekcha)</FormLabel>
                      <FormControl>
                          <Input
                            placeholder="Mahsulot nomi (O'zbekcha)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name.ru"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Nomi (Ruscha)</FormLabel>
                          <FormControl>
                          <Input
                            placeholder="Mahsulot nomi (Ruscha)"
                            {...field}
                          />
                          </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Nomi (Inglizcha)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Mahsulot nomi (Inglizcha)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            {categories.map((cat) => (
                              <SelectItem key={cat._id} value={cat._id}>
                                {cat.name?.uz || cat.name || 'Kategoriya'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                      name="price"
                    render={({ field }) => (
                      <FormItem>
                          <FormLabel required>Narx (so'm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                            }
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
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
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
                          <TextEditor
                            value={field.value || ''}
                            onChange={field.onChange}
                          placeholder="Mahsulot haqida batafsil ma'lumot..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                    name="isActive"
                  render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Mahsulot faol</FormLabel>
                          <FormDescription>
                            Mahsulot mijozlarga ko'rinadimi?
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

                {/* Images Tab */}
                <TabsContent value="images" className="space-y-4">
                <FormField
                  control={form.control}
                    name="imageIds"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel optional>Mahsulot rasmlari</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div
                            {...getRootProps()}
                              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                isDragActive
                                ? 'border-primary bg-primary/5'
                                : 'border-muted-foreground/25 hover:border-primary/50'
                              }`}
                          >
                            <input {...getInputProps()} />
                            {uploadingImages ? (
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                  <p className="text-sm text-muted-foreground">
                                    Yuklanmoqda...
                                  </p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm">
                                  {isDragActive
                                    ? 'Rasmlarni bu yerga tashlang'
                                    : 'Rasmlarni bu yerga tashlang yoki bosing'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG, WEBP (maks. 5MB)
                                </p>
                              </div>
                            )}
                          </div>

                          {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-4">
                              {imagePreviews.map((preview, index) => (
                                  <div
                                    key={index}
                                    className="relative group"
                                  >
                                    <div
                                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                                        index === mainImageIndex
                                          ? 'border-primary'
                                          : 'border-muted'
                                      }`}
                                    >
                                      <img
                                        src={preview.url || preview.preview}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                    {index === mainImageIndex && (
                                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-current" />
                                        Asosiy
                                      </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                      <Button
                                    type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setMainImage(index)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                                        disabled={index === mainImageIndex}
                                      >
                                        <Star className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                    onClick={() => removeImage(index)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

                {/* Discount Tab */}
                <TabsContent value="discount" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="discountEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Chegirma yoqilgan</FormLabel>
                          <FormDescription>
                            Mahsulotga chegirma qo'shish
                          </FormDescription>
                  </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (!checked) {
                                form.setValue('discountValue', 0);
                                form.setValue('discountStartAt', null);
                                form.setValue('discountEndAt', null);
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch('discountEnabled') && (
                    <>
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
                                <SelectItem value="AMOUNT">So'm (miqdor)</SelectItem>
                                <SelectItem value="PERCENT">Foiz (%)</SelectItem>
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
                            <FormLabel>
                              {form.watch('discountType') === 'PERCENT'
                                ? 'Chegirma foizi'
                                : 'Chegirma miqdori (so\'m)'}
                            </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(parseFloat(e.target.value) || 0)
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                      <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                          name="discountStartAt"
                              render={({ field }) => (
                                <FormItem>
                              <FormLabel>Boshlanish sanasi</FormLabel>
                                  <FormControl>
                                <DatePicker
                                  value={field.value}
                                  onChange={(date) => field.onChange(date)}
                                    />
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
                              <FormLabel>Tugash sanasi</FormLabel>
                                  <FormControl>
                                <DatePicker
                                  value={field.value}
                                  onChange={(date) => field.onChange(date)}
                                />
                                  </FormControl>
                              <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                    </>
                )}
              </TabsContent>

                {/* Stock Management Tab */}
                <TabsContent value="stock" className="space-y-4">
                <FormField
                  control={form.control}
                    name="yellowLine"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel optional>Sariq chiziq</FormLabel>
                          <FormControl>
                            <Input
                            type="number"
                            placeholder="0"
                              {...field}
                              onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                        <FormDescription>
                          Ombordagi miqdor shu qiymatdan past bo'lganda ogohlantirish
                        </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                    name="redLine"
                      render={({ field }) => (
                        <FormItem>
                        <FormLabel optional>Qizil chiziq</FormLabel>
                          <FormControl>
                            <Input
                            type="number"
                            placeholder="0"
                              {...field}
                              onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                        <FormDescription>
                          Ombordagi miqdor shu qiymatdan past bo'lganda jiddiy ogohlantirish
                        </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  {/* Stock Alerts */}
                  <div className="rounded-lg border p-4 space-y-2">
                    <Label className="text-base font-semibold">Ombordagi holat</Label>
                  <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Joriy miqdor:</span>
                        <span className="font-medium">{inStock} dona</span>
                      </div>
                      {yellowLine > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            Sariq chiziq:
                          </span>
                          <span className="font-medium">{yellowLine} dona</span>
                  </div>
                )}
                      {redLine > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Qizil chiziq:
                          </span>
                          <span className="font-medium">{redLine} dona</span>
              </div>
              )}
                      {inStock <= redLine && redLine > 0 && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
                          ⚠️ Jiddiy ogohlantirish: Ombordagi miqdor qizil chiziqdan past!
            </div>
                      )}
                      {inStock <= yellowLine && inStock > redLine && yellowLine > 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-800 dark:text-yellow-200">
                          ⚠️ Ogohlantirish: Ombordagi miqdor sariq chiziqdan past!
                        </div>
                      )}
                      {inStock > yellowLine && yellowLine > 0 && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-800 dark:text-green-200">
                          ✓ Ombordagi miqdor normal
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Bekor qilish
              </Button>
                <Button type="submit" disabled={uploadingImages || loadingProduct}>
                {uploadingImages && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {product ? 'Yangilash' : 'Yaratish'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default ProductForm;
