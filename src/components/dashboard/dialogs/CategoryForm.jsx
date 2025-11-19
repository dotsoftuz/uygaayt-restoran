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
import { Button } from '@/components/ui/button';
import {
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadImage, fetchStoreCategories, getStoreCategoryById } from '@/services/storeCategories';

const categorySchema = z.object({
  name: z.object({
    uz: z.string().min(1, 'O\'zbekcha nom majburiy'),
    ru: z.string().min(1, 'Ruscha nom majburiy'),
    en: z.string().min(1, 'Inglizcha nom majburiy'),
  }),
  imageId: z.string().optional().nullable(),
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
            // File nomi va type'ni saqlab qolish
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

function CategoryForm({ open, onOpenChange, category = null, parentId = null, onSave, onRefresh }) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [allCategories, setAllCategories] = useState([]);

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: {
        uz: '',
        ru: '',
        en: '',
      },
      imageId: null,
    },
  });

  // Load all categories for parent selection
  useEffect(() => {
    if (open) {
      fetchStoreCategories({ page: 1, limit: 200 })
        .then((res) => {
          // Response structure: { statusCode, code, data: { data: [], total }, message, time }
          if (res?.data?.data) {
            setAllCategories(res.data.data);
          } else if (res?.data && Array.isArray(res.data)) {
            setAllCategories(res.data);
          }
        })
        .catch(console.error);
    }
  }, [open]);

  // Load category data when editing
  useEffect(() => {
    if (category?._id && open) {
      setLoadingCategory(true);
      getStoreCategoryById(category._id)
        .then((response) => {
          // Response structure: { statusCode, code, data: {...}, message, time }
          const catData = response?.data || response;
          if (catData) {
            form.reset({
              name: catData.name || { uz: '', ru: '', en: '' },
              imageId: catData.image?._id || null,
            });
            // Set image preview
            if (catData.image?.url) {
              const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
              // Base URL'ni tozalash - trailing slash'ni olib tashlash
              const cleanBaseUrl = baseUrl.replace(/\/$/, '');
              
              // Backend'dan kelgan URL: 'uploads/1763466603309.jpeg'
              // ServeStaticModule '/v1/uploads' path'ida serve qiladi
              let imageUrl = catData.image.url;
              
              // Agar URL 'uploads/' bilan boshlansa, faqat fayl nomini olish
              if (imageUrl.startsWith('uploads/')) {
                imageUrl = imageUrl.replace('uploads/', '');
              }
              
              // To'g'ri URL'ni yaratish: baseUrl + /uploads/ + filename
              setImagePreview(`${cleanBaseUrl}/uploads/${imageUrl}`);
            } else {
              setImagePreview(null);
            }
          }
        })
        .catch((error) => {
          console.error('Error loading category:', error);
          toast.error('Kategoriyani yuklashda xatolik yuz berdi');
        })
        .finally(() => {
          setLoadingCategory(false);
        });
    } else if (!category && open) {
      form.reset({
        name: { uz: '', ru: '', en: '' },
        imageId: null,
      });
      setImagePreview(null);
    }
  }, [category, open, form]);

  // Image upload handler
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Fayl hajmi 5MB dan katta');
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Noto\'g\'ri fayl formati');
      return;
    }

    setUploadingImage(true);

    try {
      // Avval preview'ni o'rnatish - foydalanuvchi darhol ko'radi
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);

      // Resize image
      const resizedFile = await resizeImage(file, 800, 800);

      // Upload to backend
      const response = await uploadImage(resizedFile);
      
      // API interceptor response.data ni qaytaradi, lekin turli response strukturalarini qo'llab-quvvatlash
      const imageData = response?.data || response;
      
      console.log('Image upload response:', { response, imageData });
      
      if (imageData?._id) {
        form.setValue('imageId', imageData._id);
        
        // Preview URL'ni yangilash - agar backend'dan URL kelgan bo'lsa
        if (imageData.url) {
          try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
            // Base URL'ni tozalash - trailing slash'ni olib tashlash
            const cleanBaseUrl = baseUrl.replace(/\/$/, '');
            
            // Backend'dan kelgan URL: 'uploads/1763466186234.jpeg'
            // ServeStaticModule '/v1/uploads' path'ida serve qiladi
            // Shuning uchun to'g'ri URL: 'http://localhost:3008/v1/uploads/1763466186234.jpeg'
            let imageUrl = imageData.url;
            
            // Agar URL 'uploads/' bilan boshlansa, faqat fayl nomini olish
            if (imageUrl.startsWith('uploads/')) {
              imageUrl = imageUrl.replace('uploads/', '');
            }
            
            // To'g'ri URL'ni yaratish: baseUrl + /v1/uploads/ + filename
            const serverPreviewUrl = `${cleanBaseUrl}/uploads/${imageUrl}`;
            console.log('Setting preview URL:', serverPreviewUrl);
            console.log('Image data:', imageData);
            console.log('Original URL from backend:', imageData.url);
            
            // Yangi URL'ni o'rnatish
            setImagePreview(serverPreviewUrl);
            
            // Eski blob URL'ni keyin tozalash (setTimeout bilan - state yangilanishini kutish)
            setTimeout(() => {
              if (preview && preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
              }
            }, 500);
          } catch (urlError) {
            console.error('Error setting preview URL:', urlError);
            // Agar URL o'rnatishda xatolik bo'lsa, blob URL'ni saqlab qolish
            console.log('Keeping blob preview due to URL error');
          }
        } else {
          // Agar URL kelmasa, blob URL'ni saqlab qolish
          console.log('No URL in response, keeping blob preview');
          console.log('Full imageData:', imageData);
        }
        
        toast.success('Rasm yuklandi');
      } else {
        // Eski blob URL'ni tozalash
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
        setImagePreview(null);
        throw new Error('Image upload failed - no image ID received');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // Eski blob URL'ni tozalash - preview o'zgaruvchisini ishlatish
      setImagePreview((prevPreview) => {
        if (prevPreview && prevPreview.startsWith('blob:')) {
          URL.revokeObjectURL(prevPreview);
        }
        return null;
      });
      toast.error('Rasmlarni yuklashda xatolik yuz berdi');
    } finally {
      setUploadingImage(false);
    }
  }, [form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: false,
  });

  const removeImage = () => {
    setImagePreview(null);
    form.setValue('imageId', null);
  };

  const handleSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        imageId: data.imageId || undefined,
      };
      
      // Faqat yangi kategoriya yaratilganda parentId qo'shiladi
      if (!category) {
        payload.parentId = parentId || undefined;
      }

      await onSave(payload);
      form.reset();
      setImagePreview(null);
    } catch (error) {
      console.error('Error saving category:', error);
      // Error is handled in parent component
      throw error; // Re-throw to let parent handle it
    }
  };

  const currentLang = localStorage.getItem('i18nextLng') || 'uz';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {category ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
          </SheetTitle>
          <SheetDescription>
            Kategoriya ma'lumotlarini to'ldiring va saqlang
          </SheetDescription>
        </SheetHeader>

        {loadingCategory ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name.uz"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Nomi (O'zbekcha)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Kategoriya nomi (O'zbekcha)"
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
                          placeholder="Kategoriya nomi (Ruscha)"
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
                          placeholder="Kategoriya nomi (Inglizcha)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Upload Section */}
                <FormField
                  control={form.control}
                  name="imageId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional>Kategoriya rasmi</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {imagePreview ? (
                            <div className="relative">
                              <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={removeImage}
                                className="absolute top-2 right-2"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div
                              {...getRootProps()}
                              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                isDragActive
                                  ? 'border-primary bg-primary/5'
                                  : 'border-muted-foreground/25 hover:border-primary/50'
                              }`}
                            >
                              <input {...getInputProps()} />
                              {uploadingImage ? (
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
                                      ? 'Rasmni bu yerga tashlang'
                                      : 'Rasmni bu yerga tashlang yoki bosing'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PNG, JPG, WEBP (maks. 5MB)
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <SheetFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Bekor qilish
                </Button>
                <Button type="submit" disabled={uploadingImage || loadingCategory}>
                  {uploadingImage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {category ? 'Yangilash' : 'Yaratish'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default CategoryForm;
