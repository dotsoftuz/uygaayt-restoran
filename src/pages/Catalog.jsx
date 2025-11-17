import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  FolderTree,
  Image as ImageIcon,
  Search,
  MoreVertical,
  ArrowLeft,
  Loader2,
  GripVertical,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  fetchStoreCategories,
  deleteStoreCategory,
  updateCategoryPositions,
  createStoreCategory,
  updateStoreCategory,
  getStoreCategoryById,
} from '@/services/storeCategories';
import CategoryForm from '@/components/dashboard/dialogs/CategoryForm';

function Catalog() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);
  const [loadingParent, setLoadingParent] = useState(false);
  const [isUpdatingPositions, setIsUpdatingPositions] = useState(false);

  const currentLang = localStorage.getItem('i18nextLng') || 'uz';

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get category name in current language
  const getCategoryName = (category) => {
    if (!category) return 'Nomsiz';
    return category.name?.[currentLang] || category.name?.uz || category.name || 'Nomsiz';
  };

  // Get parentId from URL params
  useEffect(() => {
    const parentIdParam = searchParams.get('parentId');
    if (parentIdParam) {
      setParentId(parentIdParam);
      setLoadingParent(true);
      // Fetch parent category info by ID
      getStoreCategoryById(parentIdParam)
        .then((response) => {
          const catData = response?.data || response;
          if (catData) {
            setParentCategory(catData);
          }
        })
        .catch((error) => {
          console.error('Error loading parent category:', error);
        })
        .finally(() => {
          setLoadingParent(false);
        });
    } else {
      setParentId(null);
      setParentCategory(null);
    }
  }, [searchParams]);

  // Fetch categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetchStoreCategories({
        page: 1,
        limit: 200,
        parentId: parentId,
      });
      // Response structure: { statusCode, code, data: { data: [], total }, message, time }
      if (response?.data?.data) {
        // Yangi array yaratish - React state yangilanishi uchun
        // To'liq yangi array yaratish orqali React state to'g'ri yangilanadi
        const newCategories = response.data.data.map(cat => ({ ...cat }));
        setCategories(newCategories);
      } else if (response?.data && Array.isArray(response.data)) {
        // Fallback: if data is directly an array
        setCategories(response.data.map(cat => ({ ...cat })));
      } else if (Array.isArray(response)) {
        // Fallback: if response is directly an array
        setCategories(response.map(cat => ({ ...cat })));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Kategoriyalarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [parentId]);

  // Filter categories by search term
  const filteredCategories = useMemo(() => {
    if (!debouncedSearchTerm) return categories;

    const searchLower = debouncedSearchTerm.toLowerCase();
    return categories.filter((cat) => {
      const name = cat.name?.[currentLang] || cat.name?.uz || '';
      return name.toLowerCase().includes(searchLower);
    });
  }, [categories, debouncedSearchTerm, currentLang]);

  // Handle drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Use filteredCategories for drag, but update the full categories array
    const oldIndex = filteredCategories.findIndex((cat) => cat._id === active.id);
    const newIndex = filteredCategories.findIndex((cat) => cat._id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Get the actual categories from the full list that match filtered ones
    const reorderedFiltered = arrayMove(filteredCategories, oldIndex, newIndex);

    // Map back to full categories array maintaining order
    const categoryMap = new Map(categories.map((cat) => [cat._id, cat]));
    const newCategories = reorderedFiltered.map((cat) => categoryMap.get(cat._id)).filter(Boolean);

    // Add any categories that weren't in filtered list (shouldn't happen, but safety check)
    const filteredIds = new Set(reorderedFiltered.map((cat) => cat._id));
    categories.forEach((cat) => {
      if (!filteredIds.has(cat._id)) {
        newCategories.push(cat);
      }
    });

    // Update local state immediately for better UX
    setCategories(newCategories);

    // Update positions on backend
    try {
      setIsUpdatingPositions(true);
      const categoryIds = newCategories.map((cat) => cat._id);
      await updateCategoryPositions(categoryIds);
      toast.success('Kategoriyalar tartibi yangilandi');
    } catch (error) {
      console.error('Error updating positions:', error);
      toast.error('Kategoriyalar tartibini yangilashda xatolik yuz berdi');
      // Revert on error
      await loadCategories();
    } finally {
      setIsUpdatingPositions(false);
    }
  };

  // Sortable Row Component
  const SortableRow = ({ category, index }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: category._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const imageUrl = getImageUrl(category);
    const categoryName = getCategoryName(category);

    return (
      <TableRow
        ref={setNodeRef}
        style={style}
        key={category._id}
        className="hover:bg-muted/50 cursor-pointer"
        onClick={() => handleCategoryClick(category)}
      >
        {/* Drag Handle Column */}
        <TableCell className="w-6 px-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </TableCell>

        {/* Category Name Column */}
        <TableCell>
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={imageUrl}
                  alt={categoryName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm sm:text-base">
                  {categoryName}
                </span>
              </div>
            </div>
          </div>
        </TableCell>

        {/* Product Count Column */}
        <TableCell className="hidden md:table-cell text-center w-32">
          <Badge variant="outline" className="text-xs">
            {category.productCount || 0} ta
          </Badge>
        </TableCell>

        {/* Actions Column */}
        <TableCell className="text-right w-24" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            {isMobile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                    <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(category)}>
                    <Edit className="h-4 w-4" />
                    Tahrirlash
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDelete(category)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    O'chirish
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={() => handleEdit(category)}
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={() => handleDelete(category)}
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  // Handle category click - navigate to subcategories
  const handleCategoryClick = (category) => {
    navigate(`/dashboard/catalog?parentId=${category._id}`);
  };

  // Handle back navigation
  const handleBack = () => {
    if (parentCategory?.parentId) {
      navigate(`/dashboard/catalog?parentId=${parentCategory.parentId}`);
    } else {
      navigate('/dashboard/catalog');
    }
  };

  // Handle create new category
  const handleCreateNew = () => {
    setEditingCategory(null);
    setCategoryFormOpen(true);
  };

  // Handle edit category
  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryFormOpen(true);
  };

  // Handle save category
  const handleSaveCategory = async (categoryData) => {
    try {
      if (editingCategory) {
        // Edit qilganda parentId ni o'zgartirmaslik kerak
        const updateData = {
          ...categoryData,
          _id: editingCategory._id,
        };
        // parentId ni olib tashlash, chunki edit qilganda o'zgartirilmaydi
        delete updateData.parentId;

        await updateStoreCategory(updateData);
        toast.success('Kategoriya yangilandi');
      } else {
        await createStoreCategory({
          ...categoryData,
          parentId: parentId || undefined,
        });
        toast.success('Kategoriya yaratildi');
      }
      setCategoryFormOpen(false);
      setEditingCategory(null);
      // Ro'yxatni darhol yangilash
      await loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(
        error?.message || 'Kategoriyani saqlashda xatolik yuz berdi'
      );
    }
  };

  // Handle delete category
  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      console.log('Deleting category:', categoryToDelete._id, categoryToDelete);
      const response = await deleteStoreCategory(categoryToDelete._id);
      console.log('Delete response:', response);

      toast.success('Kategoriya o\'chirildi');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);

      // Ro'yxatni darhol yangilash
      await loadCategories();

      console.log('Categories reloaded after delete');
    } catch (error) {
      console.error('Error deleting category:', error);
      console.error('Error details:', {
        message: error?.message,
        statusCode: error?.statusCode,
        code: error?.code,
        data: error?.data,
      });
      toast.error(
        error?.message || 'Kategoriyani o\'chirishda xatolik yuz berdi'
      );
    }
  };

  // Get image URL
  const getImageUrl = (category) => {
    if (category.image?.url) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
      // Remove /v1 from baseUrl if present, then add /uploads
      const cleanBaseUrl = baseUrl.replace('/v1', '');
      return `${cleanBaseUrl}/uploads/${category.image.url}`;
    }
    return null;
  };

  return (
    <div className="space-y-4 py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          {parentId && (
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h2 className="title">
              {parentCategory
                ? getCategoryName(parentCategory)
                : 'Kategoriyalar / Katalog'}
            </h2>
            <p className="paragraph">
              {parentId
                ? 'Ichki kategoriyalarni boshqaring'
                : 'Kategoriyalar va subkategoriyalarni boshqaring'}
            </p>
          </div>
        </div>
        <Button onClick={handleCreateNew} size="sm">
          <Plus className="h-4 w-4" />
          <span className="text-xs sm:text-sm">
            {parentId ? 'Yangi subkategoriya' : 'Yangi kategoriya'}
          </span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Kategoriya nomi bo'yicha qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-sm sm:text-base"
        />
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="overflow-x-auto relative">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-6 px-2"></TableHead>
                      <TableHead className="w-[10rem]">Kategoriya</TableHead>
                      <TableHead className="hidden md:table-cell text-center w-32">
                        Mahsulotlar
                      </TableHead>
                      <TableHead className="text-right w-24">Amal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <SortableContext
                      items={filteredCategories.map((cat) => cat._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {filteredCategories.map((category, index) => (
                        <SortableRow key={category._id} category={category} index={index} />
                      ))}
                    </SortableContext>
                  </TableBody>
                </Table>
              </DndContext>
              {isUpdatingPositions && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Tartib yangilanmoqda...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderTree className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>
                  {searchTerm
                    ? 'Kategoriya topilmadi'
                    : 'Hech qanday kategoriya yo\'q'}
                </EmptyTitle>
                <EmptyDescription>
                  {searchTerm
                    ? 'Qidiruv natijasiga mos kategoriya topilmadi. Boshqa qidiruv so\'zlarini sinab ko\'ring.'
                    : parentId
                      ? 'Hali hech qanday subkategoriya yaratilmagan. "Yangi subkategoriya" tugmasini bosing.'
                      : 'Hali hech qanday kategoriya yaratilmagan. "Yangi kategoriya" tugmasini bosing va birinchi kategoriyangizni yarating.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      {/* Category Form */}
      <CategoryForm
        open={categoryFormOpen}
        onOpenChange={(open) => {
          setCategoryFormOpen(open);
          if (!open) {
            setEditingCategory(null);
          }
        }}
        category={editingCategory}
        parentId={parentId}
        onSave={handleSaveCategory}
        onRefresh={loadCategories}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Kategoriyani o'chirish</DialogTitle>
            <DialogDescription>
              Bu kategoriyani o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {categoryToDelete && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>{getCategoryName(categoryToDelete)}</strong> kategoriyasi butunlay o'chiriladi.
                </p>
                {categoryToDelete.productCount > 0 && (
                  <p className="text-sm text-yellow-600">
                    Ushbu kategoriyada {categoryToDelete.productCount} ta mahsulot bor.
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Catalog;
