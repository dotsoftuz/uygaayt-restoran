import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  FolderTree,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Search,
  MoreVertical,
  Package,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import CategoryForm from '@/components/dashboard/dialogs/CategoryForm';
import AssignProductsToCategory from '@/components/dashboard/dialogs/AssignProductsToCategory';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

// Mock categories data generator
const generateFakeCategories = () => {
  const categories = [
    {
      id: 'cat-1',
      name: 'Ovqat',
      slug: 'ovqat',
      parentId: null,
      image: null,
      displayOrder: 1,
      isActive: true,
      productCount: 25,
      metaTitle: 'Ovqatlar - Restoran',
      metaDescription: 'Mazali ovqatlar va taomlar',
      metaKeywords: 'ovqat, taom, restoran',
    },
    {
      id: 'cat-2',
      name: 'Ichimlik',
      slug: 'ichimlik',
      parentId: null,
      image: null,
      displayOrder: 2,
      isActive: true,
      productCount: 15,
      metaTitle: 'Ichimliklar - Restoran',
      metaDescription: 'Sovuq va issiq ichimliklar',
      metaKeywords: 'ichimlik, suv, kola',
    },
    {
      id: 'cat-3',
      name: 'Fast Food',
      slug: 'fast-food',
      parentId: null,
      image: null,
      displayOrder: 3,
      isActive: true,
      productCount: 20,
      metaTitle: 'Fast Food - Restoran',
      metaDescription: 'Tez ovqatlar',
      metaKeywords: 'fast food, tez ovqat',
    },
    {
      id: 'cat-4',
      name: 'Lavash',
      slug: 'lavash',
      parentId: 'cat-3',
      image: null,
      displayOrder: 1,
      isActive: true,
      productCount: 8,
      metaTitle: 'Lavash - Fast Food',
      metaDescription: 'Turli xil lavashlar',
      metaKeywords: 'lavash',
    },
    {
      id: 'cat-5',
      name: 'Burger',
      slug: 'burger',
      parentId: 'cat-3',
      image: null,
      displayOrder: 2,
      isActive: true,
      productCount: 12,
      metaTitle: 'Burger - Fast Food',
      metaDescription: 'Mazali burgerlar',
      metaKeywords: 'burger',
    },
  ];
  return categories;
};

function Catalog() {
  const isMobile = useIsMobile();
  const [categories, setCategories] = useState(generateFakeCategories());
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [assignProductsOpen, setAssignProductsOpen] = useState(false);
  const [categoryToAssign, setCategoryToAssign] = useState(null);

  // Build tree structure
  const categoryTree = useMemo(() => {
    const tree = [];
    const categoryMap = new Map();

    // Create map
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Build tree
    categories.forEach((cat) => {
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(categoryMap.get(cat.id));
        }
      } else {
        tree.push(categoryMap.get(cat.id));
      }
    });

    // Sort by displayOrder
    const sortByOrder = (items) => {
      items.sort((a, b) => a.displayOrder - b.displayOrder);
      items.forEach((item) => {
        if (item.children.length > 0) {
          sortByOrder(item.children);
        }
      });
    };

    sortByOrder(tree);
    return tree;
  }, [categories]);

  // Filter categories
  const filteredTree = useMemo(() => {
    if (!searchTerm) return categoryTree;

    const filterTree = (items) => {
      return items
        .filter((item) => {
          const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.slug.toLowerCase().includes(searchTerm.toLowerCase());
          const hasMatchingChildren =
            item.children.length > 0 &&
            filterTree(item.children).length > 0;
          return matchesSearch || hasMatchingChildren;
        })
        .map((item) => ({
          ...item,
          children: filterTree(item.children),
        }));
    };

    return filterTree(categoryTree);
  }, [categoryTree, searchTerm]);

  const toggleExpand = (categoryId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCreateNew = () => {
    setEditingCategory(null);
    setCategoryFormOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryFormOpen(true);
  };

  const handleSaveCategory = async (categoryData) => {
    console.log('Saving category:', categoryData);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (editingCategory) {
      // Update existing
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id ? { ...cat, ...categoryData } : cat
        )
      );
      toast.success('Kategoriya yangilandi');
    } else {
      // Create new
      const newCategory = {
        id: `cat-${Date.now()}`,
        ...categoryData,
        productCount: 0,
      };
      setCategories((prev) => [...prev, newCategory]);
      toast.success('Kategoriya yaratildi');
    }

    setCategoryFormOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      // Check if category has children
      const hasChildren = categories.some(
        (cat) => cat.parentId === categoryToDelete.id
      );

      if (hasChildren) {
        toast.error('Bu kategoriyada subkategoriyalar bor. Avval ularni o\'chiring');
        return;
      }

      setCategories((prev) =>
        prev.filter((cat) => cat.id !== categoryToDelete.id)
      );
      toast.success('Kategoriya o\'chirildi');
    }
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleMoveOrder = (categoryId, direction) => {
    setCategories((prev) => {
      const category = prev.find((c) => c.id === categoryId);
      if (!category) return prev;

      const siblings = prev.filter(
        (c) => c.parentId === category.parentId
      );
      const currentIndex = siblings.findIndex((c) => c.id === categoryId);

      if (
        (direction === 'up' && currentIndex === 0) ||
        (direction === 'down' && currentIndex === siblings.length - 1)
      ) {
        return prev;
      }

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const targetCategory = siblings[newIndex];

      return prev.map((c) => {
        if (c.id === categoryId) {
          return { ...c, displayOrder: targetCategory.displayOrder };
        }
        if (c.id === targetCategory.id) {
          return { ...c, displayOrder: category.displayOrder };
        }
        return c;
      });
    });
  };

  const handleToggleActive = (categoryId) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
      )
    );
    toast.success('Kategoriya holati o\'zgartirildi');
  };

  const handleAssignProducts = (category) => {
    setCategoryToAssign(category);
    setAssignProductsOpen(true);
  };

  const handleAssignProductsSubmit = async (data) => {
    console.log('Assigning products:', data);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update product count for category
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === data.categoryId
          ? { ...cat, productCount: data.productIds.length }
          : cat
      )
    );

    toast.success('Mahsulotlar kategoriyaga biriktirildi');
    setAssignProductsOpen(false);
    setCategoryToAssign(null);
  };

  // Render category row
  const renderCategoryRow = (category, level = 0, isLast = false) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const indent = level * (isMobile ? 16 : 24);

    return (
      <React.Fragment key={category.id}>
        <TableRow className="hover:bg-muted/50">
          <TableCell style={{ paddingLeft: `${isMobile ? 8 : 16}px` }}>
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => toggleExpand(category.id)}
                >
                  {isExpanded ? (
                    <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <Folder className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-6 flex-shrink-0" />
              )}
              <div
                className="flex items-center gap-2 flex-1 min-w-0"
                style={{ marginLeft: `${indent}px` }}
              >
                {category.image ? (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium text-xs sm:text-sm md:text-base truncate">
                      {category.name}
                    </span>
                    {!category.isActive && (
                      <Badge variant="secondary" className="text-xs w-fit">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Yashirilgan
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    /{category.slug}
                  </p>
                </div>
              </div>
            </div>
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleMoveOrder(category.id, 'up')}
                disabled={level === 0 && category.displayOrder === 1}
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <span className="text-xs font-mono w-8 text-center">
                {category.displayOrder}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleMoveOrder(category.id, 'down')}
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
          </TableCell>
          <TableCell className="hidden md:table-cell text-center">
            <Badge variant="outline" className="text-xs">
              {category.productCount || 0} ta
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={() => handleToggleActive(category.id)}
                title={category.isActive ? 'Yashirish' : 'Ko\'rsatish'}
              >
                {category.isActive ? (
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
              {isMobile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                      <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleAssignProducts(category)}>
                      <Package className="h-4 w-4" />
                      Mahsulotlarni biriktirish
                    </DropdownMenuItem>
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
                    onClick={() => handleAssignProducts(category)}
                    title="Mahsulotlarni biriktirish"
                  >
                    <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
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
        {hasChildren &&
          isExpanded &&
          category.children.map((child, index) =>
            renderCategoryRow(
              child,
              level + 1,
              index === category.children.length - 1
            )
          )}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-4 py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="title">Kategoriyalar / Katalog</h2>
          <p className="paragraph">
            Kategoriyalar va subkategoriyalarni boshqaring
          </p>
        </div>
        <Button onClick={handleCreateNew} size="sm" className="">
          <Plus className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Yangi kategoriya</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Kategoriya nomi yoki slug bo'yicha qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-sm sm:text-base"
        />
      </div>

      {/* Categories Table */}
      <Card>
        {/* <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Kategoriyalar ro'yxati</CardTitle>
        </CardHeader> */}
        <CardContent className="p-0">
          {filteredTree.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategoriya</TableHead>
                    <TableHead className="hidden sm:table-cell">Tartib</TableHead>
                    <TableHead className="hidden md:table-cell text-center">
                      Mahsulotlar
                    </TableHead>
                    <TableHead className="text-right">Amal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTree.map((category, index) =>
                    renderCategoryRow(
                      category,
                      0,
                      index === filteredTree.length - 1
                    )
                  )}
                </TableBody>
              </Table>
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
        categories={categories}
        onSave={handleSaveCategory}
      />

      {/* Assign Products Dialog */}
      <AssignProductsToCategory
        open={assignProductsOpen}
        onOpenChange={(open) => {
          setAssignProductsOpen(open);
          if (!open) {
            setCategoryToAssign(null);
          }
        }}
        category={categoryToAssign}
        allCategories={categories}
        onAssign={handleAssignProductsSubmit}
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
                  <strong>{categoryToDelete.name}</strong> kategoriyasi butunlay o'chiriladi.
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
