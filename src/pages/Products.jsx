import ProductForm from '@/components/dashboard/dialogs/ProductForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
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
import { useDebounce } from '@/hooks/use-debounce';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatNumber } from '@/lib/utils';
import {
  createStoreProduct,
  deleteStoreProduct,
  fetchCategories,
  fetchStoreProducts,
  updateStoreProduct,
} from '@/services/storeProducts';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  Filter,
  Grid3x3,
  Image as ImageIcon,
  List,
  MoreVertical,
  Package,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

function Products() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [categories, setCategories] = useState([]);

  // Sort and filter states - initialize from URL params
  const [sortBy, setSortBy] = useState(() => {
    const sortParam = searchParams.get('sort');
    if (sortParam?.includes('name')) return 'name';
    if (sortParam?.includes('price')) return 'price';
    if (sortParam?.includes('stock')) return 'stock';
    if (sortParam?.includes('date')) return 'date';
    return 'date';
  });
  const [sortOrder, setSortOrder] = useState(() => {
    const sortParam = searchParams.get('sort');
    if (sortParam?.endsWith('_desc')) return 'desc';
    return 'asc';
  });
  const [statusFilter, setStatusFilter] = useState(() => {
    return searchParams.get('status') || 'all';
  });
  const [categoryFilter, setCategoryFilter] = useState(() => {
    return searchParams.get('category') || 'all';
  });
  const [stockFilter, setStockFilter] = useState(() => {
    return searchParams.get('stock') || 'all';
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // Default: list view

  // Pagination states - initialize from URL params
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const limitParam = searchParams.get('limit');
    return limitParam ? parseInt(limitParam, 10) : 20;
  });

  // Form and dialog states
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Bulk selection
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Initialize search from URL
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  // Load categories
  useEffect(() => {
    if (productFormOpen || categoryFilter !== 'all') {
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
  }, [productFormOpen, categoryFilter]);

  // Fetch products with pagination and server-side filtering/sorting
  const loadProducts = async () => {
    try {
      setLoading(true);

      // Map sortBy to backend field names
      let backendSortBy = '';
      if (sortBy === 'name') {
        backendSortBy = 'name.uz';
      } else if (sortBy === 'price') {
        backendSortBy = 'price';
      } else if (sortBy === 'stock') {
        backendSortBy = 'inStock';
      } else if (sortBy === 'date') {
        backendSortBy = 'createdAt';
      }

      // Map stock filter to stockState
      let stockState = null;
      if (stockFilter === 'low') {
        stockState = 'yellowLine';
      } else if (stockFilter === 'out') {
        stockState = 'redLine';
      }

      const response = await fetchStoreProducts({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm || '',
        sortBy: backendSortBy,
        sortOrder: sortOrder,
        categoryId: categoryFilter !== 'all' ? categoryFilter : null,
        isActive: statusFilter === 'all' ? null : statusFilter === 'active',
        stockState: stockState,
      });

      if (response?.data?.data) {
        setProducts(response.data.data);
        setTotalProducts(response.data.total || 0);
      } else if (response?.data && Array.isArray(response.data)) {
        setProducts(response.data);
        setTotalProducts(response.data.length);
      } else if (Array.isArray(response)) {
        setProducts(response);
        setTotalProducts(response.length);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(t('productsLoadError'));
    } finally {
      setLoading(false);
    }
  };

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    sortBy,
    sortOrder,
    statusFilter,
    categoryFilter,
    stockFilter,
  ]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedProducts([]);
    setSelectAll(false);
  }, [
    statusFilter,
    categoryFilter,
    stockFilter,
    sortBy,
    sortOrder,
    debouncedSearchTerm,
  ]);

  // Update URL when filters and sort change
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    }

    if (statusFilter !== 'all') {
      params.set('status', statusFilter);
    }

    if (categoryFilter !== 'all') {
      params.set('category', categoryFilter);
    }

    if (stockFilter !== 'all') {
      params.set('stock', stockFilter);
    }

    const sortValue = `${sortBy}_${sortOrder}`;
    if (sortValue !== 'date_desc') {
      params.set('sort', sortValue);
    }

    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    if (itemsPerPage !== 20) {
      params.set('limit', itemsPerPage.toString());
    }

    setSearchParams(params, { replace: true });
  }, [
    debouncedSearchTerm,
    statusFilter,
    categoryFilter,
    stockFilter,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
  ]);

  // Handle sort change
  const handleSortChange = (value) => {
    if (value === 'name_asc') {
      setSortBy('name');
      setSortOrder('asc');
    } else if (value === 'name_desc') {
      setSortBy('name');
      setSortOrder('desc');
    } else if (value === 'price_asc') {
      setSortBy('price');
      setSortOrder('asc');
    } else if (value === 'price_desc') {
      setSortBy('price');
      setSortOrder('desc');
    } else if (value === 'stock_asc') {
      setSortBy('stock');
      setSortOrder('asc');
    } else if (value === 'stock_desc') {
      setSortBy('stock');
      setSortOrder('desc');
    } else if (value === 'date_asc') {
      setSortBy('date');
      setSortOrder('asc');
    } else if (value === 'date_desc') {
      setSortBy('date');
      setSortOrder('desc');
    }
  };

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

  // Get product name
  const getProductName = (product) => {
    const currentLang = localStorage.getItem('i18nextLng') || 'uz';
    return (
      product.name?.[currentLang] ||
      product.name?.uz ||
      product.name ||
      t('product')
    );
  };

  // Get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    if (category) {
      const currentLang = localStorage.getItem('i18nextLng') || 'uz';
      return (
        category.name?.[currentLang] ||
        category.name?.uz ||
        category.name ||
        t('category')
      );
    }
    return t('category');
  };

  // Get image URL
  const getImageUrl = (product) => {
    const formatImageUrl = (imageUrl) => {
      if (!imageUrl) return null;
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      // Backend'dan kelgan URL: 'uploads/1763466603309.jpeg'
      // ServeStaticModule '/v1/uploads' path'ida serve qiladi
      let url = imageUrl;
      if (url.startsWith('uploads/')) {
        url = url.replace('uploads/', '');
      }
      return `${cleanBaseUrl}/uploads/${url}`;
    };

    if (product.mainImage?.url) {
      return formatImageUrl(product.mainImage.url);
    }
    if (product.images?.[0]?.url) {
      return formatImageUrl(product.images[0].url);
    }
    return null;
  };

  // Handle create new product
  const handleCreateNew = () => {
    setEditingProduct(null);
    setProductFormOpen(true);
  };

  // Handle view product
  const handleView = (product) => {
    navigate(`/dashboard/product-detail/${product._id}`);
  };

  // Handle edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  // Handle save product
  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await updateStoreProduct(productData);
        toast.success(t('productUpdated'));
      } else {
        await createStoreProduct(productData);
        toast.success(t('productCreated'));
      }
      setProductFormOpen(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);

      // Show validation errors if available
      // API interceptor returns response.data, so error is already the data object
      if (error?.data && Array.isArray(error.data)) {
        const validationErrors = error.data
          .map(
            (err) =>
              err.message || `${err.property || ''}: ${err.message || ''}`
          )
          .filter((msg) => msg)
          .join('\n');
        if (validationErrors) {
          toast.error(`${t('validationErrors')}\n${validationErrors}`);
        } else {
          toast.error(error.message || t('productSaveError'));
        }
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error(t('productSaveError'));
      }

      throw error;
    }
  };

  // Handle delete product
  const handleDelete = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteStoreProduct(productToDelete._id);
      toast.success(t('productDeleted'));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error?.message || t('productDeletionError'));
    }
  };

  // Bulk selection
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedProducts(products.map((p) => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId, checked) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
      setSelectAll(false);
    }
  };

  // Update selectAll when selection changes
  useEffect(() => {
    if (products.length > 0) {
      setSelectAll(selectedProducts.length === products.length);
    }
  }, [selectedProducts, products]);

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const deletePromises = selectedProducts.map((id) =>
        deleteStoreProduct(id)
      );
      await Promise.all(deletePromises);
      toast.success(`${selectedProducts.length} ${t('productsDeleted')}`);
      setBulkDeleteDialogOpen(false);
      setSelectedProducts([]);
      setSelectAll(false);
      await loadProducts();
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      toast.error(t('bulkDeleteError'));
    }
  };

  // Bulk status change
  const handleBulkStatusChange = async (isActive) => {
    if (selectedProducts.length === 0) return;

    try {
      const updatePromises = selectedProducts.map((id) =>
        updateStoreProduct({ _id: id, isActive })
      );
      await Promise.all(updatePromises);
      toast.success(`${selectedProducts.length} ${t('productsStatusUpdated')}`);
      setSelectedProducts([]);
      setSelectAll(false);
      await loadProducts();
    } catch (error) {
      console.error('Error bulk updating products:', error);
      toast.error(t('productsUpdateError'));
    }
  };

  // Calculate low stock products for alerts
  const lowStockProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product.redLine && !product.yellowLine) return false;
      const stock = product.inStock || 0;
      if (product.redLine && stock <= product.redLine)
        return { type: 'red', product };
      if (
        product.yellowLine &&
        stock <= product.yellowLine &&
        stock > (product.redLine || 0)
      ) {
        return { type: 'yellow', product };
      }
      return false;
    });
  }, [products]);

  const redStockCount = lowStockProducts.filter(
    (p) => p?.type === 'red'
  ).length;
  const yellowStockCount = lowStockProducts.filter(
    (p) => p?.type === 'yellow'
  ).length;

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'ID',
      t('nameUz'),
      t('nameRu'),
      t('nameEn'),
      t('category'),
      t('price'),
      t('salePrice'),
      t('stock'),
      t('yellowLine'),
      t('redLine'),
      t('status'),
      t('createdAt'),
    ];

    const rows = products.map((product) => {
      const productName = getProductName(product);
      const categoryName = product.categoryId
        ? getCategoryName(product.categoryId)
        : '-';
      const createdAt = product.createdAt
        ? new Date(product.createdAt).toLocaleDateString()
        : '-';

      return [
        product._id || '',
        product.name?.uz || '',
        product.name?.ru || '',
        product.name?.en || '',
        categoryName,
        product.price || 0,
        product.salePrice || product.price || 0,
        product.inStock || 0,
        product.yellowLine || 0,
        product.redLine || 0,
        product.isActive ? t('active') : t('hidden'),
        createdAt,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `products_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t('csvDownloaded'));
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + products.length, totalProducts);

  return (
    <div className="space-y-4 py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="title">{t('products')}</h2>
          <p className="paragraph">{t('productsDescription')}</p>
        </div>
        <Button onClick={handleCreateNew} size="sm">
          <Plus className="h-4 w-4" />
          <span className="text-xs sm:text-sm">{t('newProduct')}</span>
        </Button>
      </div>

      {/* Stock Alerts */}
      {(redStockCount > 0 || yellowStockCount > 0) && (
        <div className="space-y-2">
          {redStockCount > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('criticalWarning')}</AlertTitle>
              <AlertDescription>
                {redStockCount} {t('redStockWarning')}
              </AlertDescription>
            </Alert>
          )}
          {yellowStockCount > 0 && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800 dark:text-yellow-200">
                {t('warning')}
              </AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                {yellowStockCount} {t('yellowStockWarning')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Search */}
      <div className="space-y-3 sm:space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('searchByProductName')}
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

        {/* Filters, Sort, Export, View Toggle Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
          {isMobile ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="w-full sm:w-auto"
            >
              <Filter className="h-4 w-4" />
              {t('filters')}
            </Button>
          ) : null}

          {(!isMobile || filtersOpen) && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              <div className="relative w-full sm:w-[160px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allStatuses')}</SelectItem>
                    <SelectItem value="active">{t('active')}</SelectItem>
                    <SelectItem value="false">{t('hidden')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative w-full sm:w-[160px]">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('category')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allCategories')}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {getCategoryName(cat._id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative w-full sm:w-[160px]">
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('inStock')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all')}</SelectItem>
                    <SelectItem value="in">{t('available')}</SelectItem>
                    <SelectItem value="low">{t('low')}</SelectItem>
                    <SelectItem value="out">{t('outOfStock')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select
                value={getCurrentSortValue()}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name_asc">{t('nameAZ')}</SelectItem>
                  <SelectItem value="name_desc">{t('nameZA')}</SelectItem>
                  <SelectItem value="price_asc">
                    {t('priceLowToHigh')}
                  </SelectItem>
                  <SelectItem value="price_desc">
                    {t('priceHighToLow')}
                  </SelectItem>
                  <SelectItem value="stock_asc">
                    {t('stockLowToHigh')}
                  </SelectItem>
                  <SelectItem value="stock_desc">
                    {t('stockHighToLow')}
                  </SelectItem>
                  <SelectItem value="date_desc">{t('newestFirst')}</SelectItem>
                  <SelectItem value="date_asc">{t('oldestFirst')}</SelectItem>
                </SelectContent>
              </Select>

              {/* CSV Export and View Toggle */}
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="flex-shrink-0"
                >
                  <Download className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{t('csvExport')}</span>
                </Button>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-r-none border-r"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-l-none"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedProducts.length} {t('selected')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkStatusChange(true)}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            {t('activate')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkStatusChange(false)}
          >
            <XCircle className="h-4 w-4 mr-1" />
            {t('hide')}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            {t('delete')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedProducts([]);
              setSelectAll(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Products Table/Grid */}
      {viewMode === 'grid' ? (
        // Grid View - No Card wrapper
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => {
              const imageUrl = getImageUrl(product);
              const productName = getProductName(product);
              const isSelected = selectedProducts.includes(product._id);
              const stockStatus = product.inStock > 0 ? 'in' : 'out';
              const isLowStock =
                product.yellowLine && product.inStock <= product.yellowLine;
              const isRedStock =
                product.redLine && product.inStock <= product.redLine;

              return (
                <Card
                  key={product._id}
                  className={`relative overflow-hidden hover:shadow-md transition-shadow ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <CardContent className="p-0">
                    {/* Checkbox and Status Badge */}
                    <div className="absolute top-1.5 left-1.5 z-10">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectProduct(product._id, checked)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="absolute top-1.5 right-1.5 z-10">
                      {product.isActive ? (
                        <Badge
                          variant="default"
                          className="text-[10px] px-1.5 py-0.5 h-5"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                          {t('active')}
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0.5 h-5"
                        >
                          <XCircle className="w-2.5 h-2.5 mr-0.5" />
                          {t('hidden')}
                        </Badge>
                      )}
                    </div>

                    {/* Image */}
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                      {/* Stock Alert on Image */}
                      {isRedStock && (
                        <div className="absolute bottom-1.5 left-1.5">
                          <Badge
                            variant="destructive"
                            className="text-[10px] px-1.5 py-0.5 h-5"
                          >
                            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                            {t('outOfStock')}
                          </Badge>
                        </div>
                      )}
                      {isLowStock && !isRedStock && (
                        <div className="absolute bottom-1.5 left-1.5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0.5 h-5 bg-yellow-500"
                          >
                            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                            {t('low')}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Product Info - Compact */}
                    <div className="p-2.5 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {product.categoryId && (
                          <Badge
                            size="sm"
                            variant="outline"
                            className="text-[10px] lg:text-xs"
                          >
                            {getCategoryName(product.categoryId)}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          <span
                            className={`text-xs font-medium ${
                              stockStatus === 'out'
                                ? 'text-destructive'
                                : isLowStock
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                            }`}
                          >
                            {product.inStock || 0} dona
                          </span>
                        </div>
                      </div>

                      <h3 className="font-semibold text-sm lg:text-base truncate mb-0.5">
                        {productName}
                      </h3>

                      {/* Price - Compact */}

                      {/* Stock and Actions - Combined Row */}
                      <div className="flex items-center justify-between pt-1.5 border-t">
                        <div>
                          {product.salePrice &&
                          product.salePrice < product.price ? (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-bold text-primary">
                                {formatNumber(product.salePrice)}{' '}
                                {t('currency')}
                              </span>
                              <span className="text-xs text-muted-foreground line-through">
                                {formatNumber(product.price)} {t('currency')}
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm font-bold">
                              {formatNumber(product.price || 0)} {t('currency')}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleView(product)}
                            title={t('view')}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleEdit(product)}
                            title={t('edit')}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(product)}
                            title={t('delete')}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Package className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>
                {searchTerm ? t('productNotFound') : t('noProductsYet')}
              </EmptyTitle>
              <EmptyDescription>
                {searchTerm
                  ? t('noProductsMatchSearch')
                  : t('noProductsDescription')}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )
      ) : (
        // Table View
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
            ) : products.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="w-[10rem]">
                        {t('product')}
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        {t('category')}
                      </TableHead>
                      <TableHead className="text-right">{t('price')}</TableHead>
                      <TableHead className="text-center">
                        {t('inStock')}
                      </TableHead>
                      <TableHead className="text-center">
                        {t('status')}
                      </TableHead>
                      <TableHead className="text-right w-24">
                        {t('actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const imageUrl = getImageUrl(product);
                      const productName = getProductName(product);
                      const isSelected = selectedProducts.includes(product._id);
                      const stockStatus = product.inStock > 0 ? 'in' : 'out';
                      const isLowStock =
                        product.yellowLine &&
                        product.inStock <= product.yellowLine;

                      return (
                        <TableRow
                          key={product._id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handleSelectProduct(product._id, checked)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {imageUrl ? (
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                                  <img
                                    src={imageUrl}
                                    alt={productName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <button
                                  onClick={() => handleView(product)}
                                  className="font-medium text-sm sm:text-base truncate hover:text-primary transition-colors text-left w-full"
                                >
                                  {productName}
                                </button>
                                {product.salePrice &&
                                  product.salePrice < product.price && (
                                    <div className="text-xs text-muted-foreground">
                                      <span className="line-through">
                                        {formatNumber(product.price)}{' '}
                                        {t('currency')}
                                      </span>{' '}
                                      <span className="text-primary font-semibold">
                                        {formatNumber(product.salePrice)}{' '}
                                        {t('currency')}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {product.categoryId ? (
                              <Badge variant="outline" className="text-xs">
                                {getCategoryName(product.categoryId)}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                -
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-semibold">
                              {formatNumber(product.price || 0)} {t('currency')}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Badge
                                variant={
                                  stockStatus === 'out'
                                    ? 'destructive'
                                    : isLowStock
                                      ? 'secondary'
                                      : 'default'
                                }
                                className="text-xs"
                              >
                                {product.inStock || 0} {t('pieces')}
                              </Badge>
                              {!!isLowStock && (
                                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {product.isActive ? (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {t('active')}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <XCircle className="w-3 h-3 mr-1" />
                                {t('inactive')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell
                            className="text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                              {isMobile ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 sm:h-8 sm:w-8"
                                    >
                                      <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleView(product)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      {t('view')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleEdit(product)}
                                    >
                                      <Edit className="h-4 w-4" />
                                      {t('edit')}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(product)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      {t('delete')}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 sm:h-8 sm:w-8"
                                    onClick={() => handleView(product)}
                                    title={t('view')}
                                  >
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 sm:h-8 sm:w-8"
                                    onClick={() => handleEdit(product)}
                                    title={t('edit')}
                                  >
                                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 sm:h-8 sm:w-8"
                                    onClick={() => handleDelete(product)}
                                    title={t('delete')}
                                  >
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Package className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>
                    {searchTerm ? t('productNotFound') : t('noProductsYet')}
                  </EmptyTitle>
                  <EmptyDescription>
                    {searchTerm
                      ? t('noProductsMatchSearch')
                      : t('noProductsDescription')}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              {t('showPerPage')}:
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
              {startIndex + 1}-{endIndex} {t('of')} {totalProducts} {t('items')}
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
              <span className="text-xs sm:text-sm">{t('previous')}</span>
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
              <span className="text-xs sm:text-sm">{t('next')}</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Product Form */}
      <ProductForm
        open={productFormOpen}
        onOpenChange={(open) => {
          setProductFormOpen(open);
          if (!open) {
            setEditingProduct(null);
          }
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
        onRefresh={loadProducts}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('deleteProduct')}</DialogTitle>
            <DialogDescription>
              {t('deleteProductDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {productToDelete && (
              <p className="text-sm text-muted-foreground">
                <strong>{getProductName(productToDelete)}</strong>{' '}
                {t('productWillBeDeleted')}
              </p>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('deleteProducts')}</DialogTitle>
            <DialogDescription>
              {selectedProducts.length} {t('deleteProductsDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Products;
