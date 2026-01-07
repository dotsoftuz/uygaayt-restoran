import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadImage } from '@/services/storeCategories';
import { fetchCategories } from '@/services/storeProducts';

const packageItemSchema = z.object({
  name: z.object({
    uz: z.string().min(1, 'O\'zbekcha nom majburiy'),
    ru: z.string().min(1, 'Ruscha nom majburiy'),
    en: z.string().min(1, 'Inglizcha nom majburiy'),
  }),
  price: z.number({ required_error: 'Narx majburiy', invalid_type_error: 'Narx raqam bo\'lishi kerak' }).min(0, 'Narx 0 dan katta yoki teng bo\'lishi kerak'),
  categoryIds: z.array(z.string()).default([]),
  imageId: z.string().min(1, 'Rasm tanlash yoki yuklash majburiy'),
  isActive: z.boolean().default(true),
});

const PACKAGE_OPTIONS = [
  {
    id: 'paper-bag',
    name: { uz: 'Qog\'oz paket', ru: 'Бумажный пакет', en: 'Paper bag' },
    image: '/assets/packages/paper-bag.jpeg',
  },
  {
    id: 'plastic-container',
    name: { uz: 'Plastik idish', ru: 'Пластиковый контейнер', en: 'Plastic container' },
    image: '/assets/packages/plastic-container.jpg',
  },
  {
    id: 'plastic-package',
    name: { uz: 'Plastik paket', ru: 'Пластиковая упаковка', en: 'Plastic package' },
    image: '/assets/packages/plastic-package.webp',
  },
  {
    id: 'reusable-bag',
    name: { uz: 'Mato sumka', ru: 'Тканевая сумка', en: 'Fabric bag' },
    image: '/assets/packages/reusable-bag.jpeg',
  },
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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

const normalizeId = (id) => {
  if (!id) return null;
  
  if (typeof id === 'object' && id.$oid) {
    return String(id.$oid);
  }

  if (typeof id === 'object' && id.toString) {
    const str = id.toString();
    if (/^[a-fA-F0-9]{24}$/.test(str)) {
      return str;
    }
  }

  if (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) {
    return id;
  }

  return String(id);
};

const buildCategoryTree = (categories) => {
  if (!categories || categories.length === 0) return [];

  const normalizedCategories = categories.map(cat => {
    const normalizedId = normalizeId(cat._id) || cat._id;
    const normalizedParentId = normalizeId(cat.parentId) || cat.parentId;
    return {
      ...cat,
      _id: normalizedId,
      parentId: normalizedParentId,
    };
  });

  const categoryMap = new Map();
  normalizedCategories.forEach(cat => {
    categoryMap.set(cat._id, { ...cat, children: [] });
  });

  const rootCategories = [];
  normalizedCategories.forEach(cat => {
    const category = categoryMap.get(cat._id);
    if (cat.parentId && categoryMap.has(cat.parentId)) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(category);
      }
    } else {
      rootCategories.push(category);
    }
  });

  const cleanTree = (nodes) => {
    return nodes.map(node => ({
      ...node,
      children: node.children && node.children.length > 0 ? cleanTree(node.children) : undefined,
    }));
  };

  return cleanTree(rootCategories);
};

function PackageItemForm({ open, onOpenChange, packageItem = null, onSave }) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectedPackageOption, setSelectedPackageOption] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const form = useForm({
    resolver: zodResolver(packageItemSchema),
    defaultValues: {
      name: {
        uz: '',
        ru: '',
        en: '',
      },
      price: 0,
      categoryIds: [],
      imageId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      fetchCategories()
        .then((response) => {
          let categoriesList = [];
          if (response?.data?.data && Array.isArray(response.data.data)) {
            categoriesList = response.data.data;
          } else if (response?.data && Array.isArray(response.data)) {
            categoriesList = response.data;
          } else if (Array.isArray(response)) {
            categoriesList = response;
          }
          
          setCategories(categoriesList);
          
          const tree = buildCategoryTree(categoriesList);
          const allExpanded = new Set();
          const collectCategoryIds = (nodes) => {
            nodes.forEach(node => {
              if (node.children && node.children.length > 0) {
                allExpanded.add(String(node._id));
                collectCategoryIds(node.children);
              }
            });
          };
          collectCategoryIds(tree);
          setExpandedCategories(allExpanded);
        })
        .catch((error) => {
          console.error('Error fetching categories:', error);
          toast.error('Kategoriyalarni yuklashda xatolik');
        });
    }
  }, [open]);
  
  const categoryTree = useMemo(() => {
    return buildCategoryTree(categories);
  }, [categories]);

  useEffect(() => {
    if (open && packageItem) {
      const categoryIds = packageItem.categoryIds || [];
      form.reset({
        name: packageItem.name || { uz: '', ru: '', en: '' },
        price: packageItem.price || 0,
        categoryIds: categoryIds,
        imageId: packageItem.imageId || '',
        isActive: packageItem.isActive !== undefined ? packageItem.isActive : true,
      });
      setSelectedCategories(categoryIds.map(id => String(id)));
      if (packageItem.image) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
        const cleanBaseUrl = baseUrl.replace(/\/$/, '');
        let url = packageItem.image.url || packageItem.image;
        if (typeof url === 'string' && url.startsWith('uploads/')) {
          url = url.replace('uploads/', '');
        }
        if (typeof url === 'string' && !url.startsWith('http')) {
          setImagePreview(`${cleanBaseUrl}/uploads/${url}`);
        } else if (typeof url === 'string') {
          setImagePreview(url);
        }
        setSelectedPackageOption(null);
        setUploadedFile(null);
      } else {
        setImagePreview(null);
        setSelectedPackageOption(null);
        setUploadedFile(null);
      }
    } else if (open && !packageItem) {
      form.reset({
        name: { uz: '', ru: '', en: '' },
        price: 0,
        categoryIds: [],
        imageId: '',
        isActive: true,
      });
      setSelectedCategories([]);
      setImagePreview(null);
      setSelectedPackageOption(null);
      setUploadedFile(null);
    }
  }, [open, packageItem, form]);

  const handlePackageOptionSelect = async (packageOption) => {
    if (uploadingImage) return;

    setSelectedPackageOption(packageOption.id);
    setUploadedFile(null);
    setUploadingImage(true);

    try {
      const response = await fetch(packageOption.image);
      const blob = await response.blob();
      const fileName = packageOption.image.split('/').pop();
      const file = new File([blob], fileName, { type: blob.type });

      const preview = URL.createObjectURL(file);
      setImagePreview(preview);

      const resizedFile = await resizeImage(file, 800, 800);
      const uploadResponse = await uploadImage(resizedFile);
      
      const imageData = uploadResponse?.data || uploadResponse;
      
      if (imageData?._id) {
        form.setValue('imageId', imageData._id);
        
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
        const cleanBaseUrl = baseUrl.replace(/\/$/, '');
        let url = imageData.url || '';
        if (url.startsWith('uploads/')) {
          url = url.replace('uploads/', '');
        }
        if (url && !url.startsWith('http')) {
          setImagePreview(`${cleanBaseUrl}/uploads/${url}`);
        } else if (url) {
          setImagePreview(url);
        }
        
        toast.success('Rasm tanlandi');
      } else {
        throw new Error('Image upload failed - no image ID received');
      }
    } catch (error) {
      console.error('Error selecting package option:', error);
      toast.error('Rasmni tanlashda xatolik yuz berdi');
      setImagePreview(null);
      setSelectedPackageOption(null);
    } finally {
      setUploadingImage(false);
    }
  };

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
    setSelectedPackageOption(null);
    setUploadedFile(file);

    try {
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);

      const resizedFile = await resizeImage(file, 800, 800);
      const response = await uploadImage(resizedFile);
      
      const imageData = response?.data || response;
      
      if (imageData?._id) {
        form.setValue('imageId', imageData._id);
        
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
        const cleanBaseUrl = baseUrl.replace(/\/$/, '');
        let url = imageData.url || '';
        if (url.startsWith('uploads/')) {
          url = url.replace('uploads/', '');
        }
        if (url && !url.startsWith('http')) {
          setImagePreview(`${cleanBaseUrl}/uploads/${url}`);
        } else if (url) {
          setImagePreview(url);
        }
        
        toast.success('Rasm yuklandi');
      } else {
        throw new Error('Image upload failed - no image ID received');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Rasmni yuklashda xatolik yuz berdi');
      setImagePreview(null);
      setUploadedFile(null);
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
    form.setValue('imageId', '');
    setSelectedPackageOption(null);
    setUploadedFile(null);
  };

  const getCategoryDisplayName = (category) => {
    const currentLang = localStorage.getItem('i18nextLng') || 'uz';
    return category.name?.[currentLang] || category.name?.uz || category.name || 'Kategoriya';
  };

  const getPackageDisplayName = (packageOption) => {
    const currentLang = localStorage.getItem('i18nextLng') || 'uz';
    return packageOption.name?.[currentLang] || packageOption.name?.uz || packageOption.id;
  };

  const getAllSubCategoryIds = (category) => {
    const ids = [];
    if (category.children && category.children.length > 0) {
      category.children.forEach(child => {
        ids.push(String(child._id));
        ids.push(...getAllSubCategoryIds(child));
      });
    }
    return ids;
  };

  const handleCategoryToggle = (categoryId, category = null) => {
    const normalizedId = String(categoryId);
    const isSelected = selectedCategories.includes(normalizedId);
    
    let newSelected;
    if (isSelected) {
      newSelected = selectedCategories.filter(id => id !== normalizedId);
      if (category && category.children && category.children.length > 0) {
        const subCategoryIds = getAllSubCategoryIds(category);
        newSelected = newSelected.filter(id => !subCategoryIds.includes(id));
      }
    } else {
      newSelected = [...selectedCategories, normalizedId];
      if (category && category.children && category.children.length > 0) {
        const subCategoryIds = getAllSubCategoryIds(category);
        subCategoryIds.forEach(subId => {
          if (!newSelected.includes(subId)) {
            newSelected.push(subId);
          }
        });
      }
    }
    
    setSelectedCategories(newSelected);
    form.setValue('categoryIds', newSelected);
  };

  const handleSelectAll = () => {
    const getAllIds = (nodes) => {
      const ids = [];
      nodes.forEach(node => {
        ids.push(String(node._id));
        if (node.children && node.children.length > 0) {
          ids.push(...getAllIds(node.children));
        }
      });
      return ids;
    };
    
    const allCategoryIds = getAllIds(categoryTree);
    if (selectedCategories.length === allCategoryIds.length) {
      setSelectedCategories([]);
      form.setValue('categoryIds', []);
    } else {
      setSelectedCategories(allCategoryIds);
      form.setValue('categoryIds', allCategoryIds);
    }
  };

  const toggleExpand = (categoryId) => {
    const normalizedId = String(categoryId);
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(normalizedId)) {
      newExpanded.delete(normalizedId);
    } else {
      newExpanded.add(normalizedId);
    }
    setExpandedCategories(newExpanded);
  };

  const CategoryTreeItem = ({ category, level = 0 }) => {
    const categoryId = String(category._id);
    const isSelected = selectedCategories.includes(categoryId);
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(categoryId);
    
    const allSubCategoryIds = hasChildren ? getAllSubCategoryIds(category) : [];
    const allSubSelected = hasChildren && allSubCategoryIds.every(id => selectedCategories.includes(id));
    
    return (
      <div className="space-y-1">
        <div className="flex items-center space-x-2" style={{ paddingLeft: `${level * 20}px` }}>
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleExpand(categoryId)}
              className="p-0.5 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          <Checkbox
            id={categoryId}
            checked={isSelected || allSubSelected}
            onCheckedChange={() => handleCategoryToggle(categoryId, category)}
          />
          <Label
            htmlFor={categoryId}
            className="text-sm font-normal cursor-pointer flex-1"
          >
            {getCategoryDisplayName(category)}
          </Label>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {category.children.map(child => (
              <CategoryTreeItem
                key={child._id}
                category={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      toast.success('Qo\'shimcha item saqlandi');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving package item:', error);
      toast.error('Ma\'lumotlarni saqlashda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLang = localStorage.getItem('i18nextLng') || 'uz';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {packageItem ? 'Qo\'shimcha itemni tahrirlash' : 'Yangi qo\'shimcha item qo\'shish'}
          </SheetTitle>
          <SheetDescription>
            Qo'shimcha item ma'lumotlarini kiriting. Bu item customer cart'ga product qo'shganda avtomatik qo'shiladi.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="name.uz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Nom (O'zbekcha)</FormLabel>
                  <FormControl>
                    <Input placeholder="Masalan: Paket, Idish, Karobka" {...field} />
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
                  <FormLabel required>Nom (Ruscha)</FormLabel>
                  <FormControl>
                    <Input placeholder="Например: Пакет, Посуда, Коробка" {...field} />
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
                  <FormLabel required>Nom (Inglizcha)</FormLabel>
                  <FormControl>
                    <Input placeholder="For example: Package, Container, Box" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Narx (so'm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        field.onChange(value);
                      }}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Kategoriyalar</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedCategories.length === categories.length ? 'Barchasini bekor qilish' : 'Barchasini tanlash'}
                </Button>
              </div>
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                {categoryTree.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Kategoriyalar topilmadi
                  </p>
                ) : (
                  categoryTree.map((category) => (
                    <CategoryTreeItem
                      key={category._id}
                      category={category}
                      level={0}
                    />
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Agar kategoriya tanlanmagan bo'lsa, barcha kategoriyalar uchun qo'shiladi
              </p>
            </div>

            <div className="space-y-4">
              <FormLabel required>Rasm</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {PACKAGE_OPTIONS.map((packageOption) => {
                  const isSelected = selectedPackageOption === packageOption.id && !uploadedFile;
                  return (
                    <button
                      key={packageOption.id}
                      type="button"
                      onClick={() => handlePackageOptionSelect(packageOption)}
                      disabled={uploadingImage}
                      className={`relative border-2 rounded-lg overflow-hidden transition-all hover:scale-105 ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary ring-offset-2'
                          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                      } ${uploadingImage ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
                    >
                      <div className="aspect-square w-full relative">
                        <img
                          src={packageOption.image}
                          alt={getPackageDisplayName(packageOption)}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="bg-primary text-primary-foreground rounded-full p-2">
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                          </div>
                        )}
                        {uploadingImage && selectedPackageOption === packageOption.id && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 text-center">
                        <p className="text-xs font-medium line-clamp-1">
                          {getPackageDisplayName(packageOption)}
                        </p>
                      </div>
                    </button>
                  );
                })}
                <div
                  {...getRootProps()}
                  className={`relative border-2 rounded-lg overflow-hidden transition-all hover:scale-105 ${
                    uploadedFile || (imagePreview && !selectedPackageOption)
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : 'border-dashed border-muted-foreground/25 hover:border-muted-foreground/50'
                  } ${uploadingImage && !selectedPackageOption ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
                >
                  <input {...getInputProps()} />
                  {imagePreview && !selectedPackageOption ? (
                    <>
                      <div className="aspect-square w-full relative">
                        <img
                          src={imagePreview}
                          alt="Uploaded preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage();
                          }}
                          disabled={uploadingImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-2">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        </div>
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 text-center">
                        <p className="text-xs font-medium line-clamp-1">Yuklangan rasm</p>
                      </div>
                    </>
                  ) : (
                    <div className="aspect-square w-full flex flex-col items-center justify-center p-4">
                      {uploadingImage && !selectedPackageOption ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                          <p className="text-xs text-muted-foreground text-center">Yuklanmoqda...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-xs font-medium text-center mb-1">Rasm yuklash</p>
                          <p className="text-xs text-muted-foreground text-center">
                            PNG, JPG, WEBP
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <FormField
                control={form.control}
                name="imageId"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Faol</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Package item faol bo'lsa, customer cart'ga avtomatik qo'shiladi
                    </p>
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

            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Saqlash
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export default PackageItemForm;

