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
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Sort and filter states - initialize from URL params
  const [sortBy, setSortBy] = useState(() => {
    const sortParam = searchParams.get('sort');
    if (sortParam === 'name_asc' || sortParam === 'name_desc') return 'name';
    if (sortParam === 'productCount_asc' || sortParam === 'productCount_desc') return 'productCount';
    return 'name';
  });
  const [sortOrder, setSortOrder] = useState(() => {
    const sortParam = searchParams.get('sort');
    if (sortParam?.endsWith('_desc')) return 'desc';
    return 'asc';
  });
  const [filterBy, setFilterBy] = useState(() => {
    return searchParams.get('filter') || 'all';
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Pagination states - initialize from URL params
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const limitParam = searchParams.get('limit');
    return limitParam ? parseInt(limitParam, 10) : 10;
  });

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

  // Initialize search term from URL params
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []); // Only on mount

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

  // Fetch categories with pagination and server-side filtering/sorting
  const loadCategories = async () => {
    try {
      setLoading(true);
      // Map sortBy to backend field names
      let backendSortBy = '';
      if (sortBy === 'name') {
        backendSortBy = 'name.uz'; // Backend uses name.uz for sorting
      } else if (sortBy === 'productCount') {
        backendSortBy = 'productCount';
      }

      const response = await fetchStoreCategories({
        page: currentPage,
        limit: itemsPerPage,
        parentId: parentId || undefined, // Don't send null
        search: debouncedSearchTerm || '',
        sortBy: backendSortBy,
        sortOrder: sortOrder,
        filterBy: filterBy, // For future server-side filtering
      });
      // Response structure: { statusCode, code, data: { data: [], total }, message, time }
      if (response?.data?.data) {
        const newCategories = response.data.data.map(cat => ({ ...cat }));
        setCategories(newCategories);
        // Set total count if available
        if (response?.data?.total !== undefined) {
          setTotalCategories(response.data.total);
        } else {
          setTotalCategories(newCategories.length);
        }
      } else if (response?.data && Array.isArray(response.data)) {
        setCategories(response.data.map(cat => ({ ...cat })));
        setTotalCategories(response.data.length);
      } else if (Array.isArray(response)) {
        setCategories(response.map(cat => ({ ...cat })));
        setTotalCategories(response.length);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Kategoriyalarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // Load categories when parentId, page, itemsPerPage, search, or sort changes
  // Note: filterBy is handled client-side, so we don't reload on filter change
  useEffect(() => {
    loadCategories();
  }, [parentId, currentPage, itemsPerPage, debouncedSearchTerm, sortBy, sortOrder]);

  // Reset to page 1 when parentId, filter, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [parentId, filterBy, sortBy, sortOrder, debouncedSearchTerm]);

  // Update URL when filters and sort change (using debounced search)
  useEffect(() => {
    const params = new URLSearchParams();

    // Preserve parentId if exists
    if (parentId) {
      params.set('parentId', parentId);
    }

    // Add search (debounced)
    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    }

    // Add filter
    if (filterBy !== 'all') {
      params.set('filter', filterBy);
    }

    // Add sort
    const sortValue = `${sortBy}_${sortOrder}`;
    if (sortValue !== 'name_asc') {
      params.set('sort', sortValue);
    }

    // Preserve pagination params
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    if (itemsPerPage !== 10) {
      params.set('limit', itemsPerPage.toString());
    }

    setSearchParams(params, { replace: true });
  }, [debouncedSearchTerm, filterBy, sortBy, sortOrder, parentId, currentPage, itemsPerPage]);

  // Filter categories (client-side for product count filter)
  const filteredCategories = useMemo(() => {
    let result = [...categories];

    // Filter by product count (client-side as backend doesn't support this yet)
    if (filterBy === 'withProducts') {
      result = result.filter((cat) => (cat.productCount || 0) > 0);
    } else if (filterBy === 'withoutProducts') {
      result = result.filter((cat) => (cat.productCount || 0) === 0);
    }

    return result;
  }, [categories, filterBy]);

  // Pagination calculations (server-side pagination)
  const totalPages = Math.ceil(totalCategories / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + filteredCategories.length;
  const paginatedCategories = filteredCategories;

  // Handle sort change (combines sortBy and sortOrder)
  const handleSortChange = (value) => {
    if (value === 'name_asc') {
      setSortBy('name');
      setSortOrder('asc');
    } else if (value === 'name_desc') {
      setSortBy('name');
      setSortOrder('desc');
    } else if (value === 'productCount_asc') {
      setSortBy('productCount');
      setSortOrder('asc');
    } else if (value === 'productCount_desc') {
      setSortBy('productCount');
      setSortOrder('desc');
    }
  };


  // Get current sort value for Select
  const getCurrentSortValue = () => {
    return `${sortBy}_${sortOrder}`;
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Handle drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Find indices in the paginated view (what user sees)
    const oldPaginatedIndex = paginatedCategories.findIndex((cat) => cat._id === active.id);
    const newPaginatedIndex = paginatedCategories.findIndex((cat) => cat._id === over.id);

    if (oldPaginatedIndex === -1 || newPaginatedIndex === -1) {
      return;
    }

    // Reorder the categories array
    const reordered = arrayMove(paginatedCategories, oldPaginatedIndex, newPaginatedIndex);

    // Update local state immediately for better UX
    setCategories(reordered);

    // Update positions on backend
    try {
      setIsUpdatingPositions(true);
      const categoryIds = reordered.map((cat) => cat._id);
      await updateCategoryPositions(categoryIds);
      toast.success('Kategoriyalar tartibi yangilandi');
      // Reload to get updated positions
      await loadCategories();
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
          <div className="flex flex-col gap-1 items-center">
            <Badge variant="outline" className="text-xs">
              {category.productCount || 0} mahsulot
            </Badge>
            {category.childrenCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {category.childrenCount} subkategoriya
              </Badge>
            )}
          </div>
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

      {/* Search and Filters */}
      <div className="space-y-3 sm:space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Kategoriya nomi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 text-sm sm:text-base"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchTerm('')}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
          {isMobile ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="w-full sm:w-auto"
            >
              <Filter className="h-4 w-4" />
              Filtrlar
            </Button>
          ) : null}

          {(!isMobile || filtersOpen) && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              <div className="relative w-full sm:w-[160px]">
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Mahsulotlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barcha kategoriyalar</SelectItem>
                    <SelectItem value="withProducts">Mahsulotlari bor</SelectItem>
                    <SelectItem value="withoutProducts">Mahsulotlari yo'q</SelectItem>
                  </SelectContent>
                </Select>
                {filterBy !== 'all' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilterBy('all');
                    }}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <Select value={getCurrentSortValue()} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name_asc">Nom (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Nom (Z-A)</SelectItem>
                  <SelectItem value="productCount_asc">Mahsulotlar soni (kamdan ko'pga)</SelectItem>
                  <SelectItem value="productCount_desc">Mahsulotlar soni (ko'pdan kamga)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-12 h-12 bg-muted animate-pulse rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                  <div className="w-20 h-6 bg-muted animate-pulse rounded" />
                </div>
              ))}
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
                      <TableHead className="w-[10rem]">
                        <div className="flex items-center gap-2">
                          Kategoriya
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => {
                              if (sortBy === 'name') {
                                handleSortChange(sortOrder === 'asc' ? 'name_desc' : 'name_asc');
                              } else {
                                handleSortChange('name_asc');
                              }
                            }}
                          >
                            {sortBy === 'name' ? (
                              sortOrder === 'asc' ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )
                            ) : (
                              <ChevronUp className="h-3 w-3 text-muted-foreground opacity-50" />
                            )}
                          </Button>
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell text-center w-32">
                        <div className="flex items-center justify-center gap-2">
                          Mahsulotlar
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => {
                              if (sortBy === 'productCount') {
                                handleSortChange(sortOrder === 'asc' ? 'productCount_desc' : 'productCount_asc');
                              } else {
                                handleSortChange('productCount_asc');
                              }
                            }}
                          >
                            {sortBy === 'productCount' ? (
                              sortOrder === 'asc' ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )
                            ) : (
                              <ChevronUp className="h-3 w-3 text-muted-foreground opacity-50" />
                            )}
                          </Button>
                        </div>
                      </TableHead>
                      <TableHead className="text-right w-24">Amal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <SortableContext
                      items={paginatedCategories.map((cat) => cat._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {paginatedCategories.map((category, index) => (
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

      {/* Pagination */}
      {filteredCategories.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Sahifada ko'rsatish:
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-full sm:w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              {startIndex + 1}-{Math.min(endIndex, totalCategories)} dan{' '}
              {totalCategories} ta
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || totalPages === 0}
              className="flex-1 sm:flex-initial"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="text-xs sm:text-sm">Oldingi</span>
            </Button>
            <span className="text-xs sm:text-sm text-muted-foreground px-2">
              {currentPage} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex-1 sm:flex-initial"
            >
              <span className="text-xs sm:text-sm">Keyingi</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

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
