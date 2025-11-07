import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  XCircle,
  Percent,
  Image as ImageIcon,
  Package,
  Upload,
  Settings,
  AlertTriangle,
  TrendingDown,
  MoreVertical,
  Filter,
  Grid3x3,
  List,
} from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';
import ProductForm from '@/components/dashboard/dialogs/ProductForm';
import StockAdjustment from '@/components/dashboard/dialogs/StockAdjustment';
import CSVImport from '@/components/dashboard/dialogs/CSVImport';
import LowStockSettings from '@/components/dashboard/dialogs/LowStockSettings';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

// Fake data generator
const generateFakeProducts = () => {
  const categories = ['Ovqat', 'Ichimlik', 'Salat', 'Desert', 'Fast Food'];
  const statuses = ['active', 'hidden'];
  const products = [];

  const productNames = [
    'Lavash',
    'Burger',
    'Pizza',
    'Salat',
    'Coca Cola',
    'Pepsi',
    'Fanta',
    'Shashlik',
    'Somsa',
    'Manti',
    'Lag\'mon',
    'Osh',
    'Mastava',
    'Sho\'rva',
    'Chuchvara',
    'Qozon Kabob',
    'Tandir',
    'Non',
    'Tort',
    'Pirog',
  ];

  for (let i = 1; i <= 50; i++) {
    const name = productNames[Math.floor(Math.random() * productNames.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const price = Math.floor(Math.random() * 100000) + 10000;
    const stock = Math.floor(Math.random() * 100);
    const sku = `SKU-${String(i).padStart(6, '0')}`;

    products.push({
      id: `PROD-${String(i).padStart(6, '0')}`,
      name: name,
      sku: sku,
      category: category,
      price: price,
      stock: stock,
      status: status,
      thumbnail: `https://via.placeholder.com/50?text=${encodeURIComponent(name)}`,
    });
  }

  return products;
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  return status === 'active' ? (
    <Badge variant="default" className="flex items-center gap-1 w-fit text-xs">
      <CheckCircle2 className="w-3 h-3" />
      Faol
    </Badge>
  ) : (
    <Badge variant="secondary" className="flex items-center gap-1 w-fit text-xs">
      <XCircle className="w-3 h-3" />
      Yashirilgan
    </Badge>
  );
};

// Product Card Component (for mobile view)
const ProductCard = ({
  product,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onStockAdjust,
  lowStockThreshold,
}) => {
  const getStockColor = () => {
    if (product.stock > lowStockThreshold) return 'text-green-600';
    if (product.stock > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with Checkbox and Product Name */}
          <div className="flex items-start gap-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base truncate">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {product.sku}
              </p>
            </div>
            <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-full h-full items-center justify-center hidden"
                style={{ display: product.thumbnail ? 'none' : 'flex' }}
              >
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Kategoriya:</span>
              <span className="font-medium">{product.category}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Narx:</span>
              <span className="font-semibold">
                {formatNumber(product.price)} so'm
              </span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Ombordagi miqdor:</span>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${getStockColor()}`}>
                  {product.stock > 0 ? `${product.stock} dona` : 'Mavjud emas'}
                </span>
                {product.stock > 0 && product.stock <= lowStockThreshold && (
                  <TrendingDown className="h-3 w-3 text-yellow-600" />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Holat:</span>
              <StatusBadge status={product.status} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              className="flex-1 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Ko'rish
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onStockAdjust}
              className="flex-1 text-xs"
            >
              <Package className="h-3 w-3 mr-1" />
              Ombordagi miqdor
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                  Tahrirlash
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                  O'chirish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function Products() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [fakeProducts] = useState(generateFakeProducts());
  const [viewMode, setViewMode] = useState('table');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Pagination states
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Bulk selection
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Dialogs
  const [updatePriceDialogOpen, setUpdatePriceDialogOpen] = useState(false);
  const [pricePercent, setPricePercent] = useState('');
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockAdjustmentOpen, setStockAdjustmentOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [lowStockSettingsOpen, setLowStockSettingsOpen] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...fakeProducts];

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((product) => product.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    if (sortBy === 'newest') {
      filtered.sort((a, b) => a.id.localeCompare(b.id));
    } else if (sortBy === 'price_low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [fakeProducts, searchTerm, statusFilter, categoryFilter, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredAndSortedProducts.length / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(
    startIndex,
    endIndex
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedProducts([]);
    setSelectAll(false);
  }, [searchTerm, statusFilter, categoryFilter, sortBy, itemsPerPage]);

  // Auto set view mode based on screen size
  useEffect(() => {
    if (isMobile) {
      setViewMode('grid');
    }
  }, [isMobile]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Selection handlers
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedProducts(paginatedProducts.map((p) => p.id));
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

  useEffect(() => {
    if (paginatedProducts.length > 0) {
      const allSelected = paginatedProducts.every((p) =>
        selectedProducts.includes(p.id)
      );
      setSelectAll(allSelected);
    }
  }, [selectedProducts, paginatedProducts]);

  // Bulk actions
  const handleBulkActivate = () => {
    if (selectedProducts.length === 0) {
      toast.error('Hech qanday mahsulot tanlanmagan');
      return;
    }
    toast.success(`${selectedProducts.length} ta mahsulot faollashtirildi`);
    setSelectedProducts([]);
    setSelectAll(false);
  };

  const handleBulkDeactivate = () => {
    if (selectedProducts.length === 0) {
      toast.error('Hech qanday mahsulot tanlanmagan');
      return;
    }
    toast.success(`${selectedProducts.length} ta mahsulot yashirildi`);
    setSelectedProducts([]);
    setSelectAll(false);
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) {
      toast.error('Hech qanday mahsulot tanlanmagan');
      return;
    }
    if (
      window.confirm(
        `${selectedProducts.length} ta mahsulotni o'chirishni xohlaysizmi?`
      )
    ) {
      toast.success(`${selectedProducts.length} ta mahsulot o'chirildi`);
      setSelectedProducts([]);
      setSelectAll(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Status'].join(','),
        ...filteredAndSortedProducts.map((p) =>
          [
            p.name,
            p.sku,
            p.category,
            p.price,
            p.stock,
            p.status,
          ].join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV fayl yuklab olindi');
  };

  const handleUpdatePricePercent = () => {
    if (!pricePercent || isNaN(pricePercent)) {
      toast.error('Foizni to\'g\'ri kiriting');
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error('Hech qanday mahsulot tanlanmagan');
      return;
    }
    toast.success(
      `${selectedProducts.length} ta mahsulot narxi ${pricePercent}% ga o'zgartirildi`
    );
    setUpdatePriceDialogOpen(false);
    setPricePercent('');
    setSelectedProducts([]);
    setSelectAll(false);
  };

  const handleView = (productId) => {
    navigate(`/dashboard/product-detail/${productId}`);
  };

  const handleEdit = (productId) => {
    const product = fakeProducts.find((p) => p.id === productId);
    if (product) {
      setEditingProduct(product);
      setProductFormOpen(true);
    }
  };

  const handleCreateNew = () => {
    setEditingProduct(null);
    setProductFormOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    console.log('Saving product:', productData);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success(editingProduct ? 'Mahsulot yangilandi' : 'Mahsulot yaratildi');
    setProductFormOpen(false);
    setEditingProduct(null);
  };

  const handleStockAdjust = (productId) => {
    const product = fakeProducts.find((p) => p.id === productId);
    if (product) {
      setAdjustingProduct(product);
      setStockAdjustmentOpen(true);
    }
  };

  const handleStockAdjustment = async (adjustment) => {
    console.log('Stock adjustment:', adjustment);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success('Ombordagi miqdor yangilandi');
    setStockAdjustmentOpen(false);
    setAdjustingProduct(null);
  };

  const handleCSVImport = async (products) => {
    console.log('Importing products:', products);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(`${products.length} ta mahsulot import qilindi`);
  };

  const handleLowStockSettingsSave = async (settings) => {
    console.log('Saving low stock settings:', settings);
    setLowStockThreshold(settings.threshold);
    localStorage.setItem('lowStockThreshold', settings.threshold.toString());
    localStorage.setItem('lowStockEnabled', settings.enabled.toString());
  };

  // Get low stock products
  const lowStockProducts = useMemo(() => {
    return fakeProducts.filter(
      (product) => product.stock !== undefined && product.stock <= lowStockThreshold
    );
  }, [fakeProducts, lowStockThreshold]);

  // Load low stock threshold from localStorage
  useEffect(() => {
    const savedThreshold = localStorage.getItem('lowStockThreshold');
    if (savedThreshold) {
      setLowStockThreshold(parseInt(savedThreshold));
    }
  }, []);

  const handleDelete = (productId) => {
    if (window.confirm("Bu mahsulotni o'chirishni xohlaysizmi?")) {
      toast.success('Mahsulot o\'chirildi');
    }
  };

  const getCategories = () => {
    return [...new Set(fakeProducts.map((p) => p.category))];
  };

  return (
    <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="title">Mahsulotlar</h2>
          <p className="paragraph">
            Barcha mahsulotlarni ko'rib chiqing va boshqaring
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isMobile && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCsvImportOpen(true)}
              >
                <Upload className="h-4 w-4" />
                CSV Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLowStockSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
                Sozlamalar
              </Button>
            </>
          )}
          <Button onClick={handleCreateNew} size="sm" className="flex-1 sm:flex-initial">
            <Plus className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Yangi mahsulot</span>
          </Button>
          {isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCsvImportOpen(true)}>
                  <Upload className="h-4 w-4" />
                  CSV Import
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLowStockSettingsOpen(true)}>
                  <Settings className="h-4 w-4" />
                  Sozlamalar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-yellow-900 dark:text-yellow-100 mb-1">
                Past ombordagi miqdor ogohlantirishi
              </h3>
              <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                {lowStockProducts.length} ta mahsulotning ombordagi miqdori {lowStockThreshold} donadan past
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStockProducts.slice(0, isMobile ? 3 : 5).map((product) => (
                  <Badge
                    key={product.id}
                    variant="outline"
                    className="bg-yellow-100 dark:bg-yellow-900/50 border-yellow-300 dark:border-yellow-700 text-xs"
                  >
                    {product.name}: {product.stock} dona
                  </Badge>
                ))}
                {lowStockProducts.length > (isMobile ? 3 : 5) && (
                  <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/50 text-xs">
                    +{lowStockProducts.length - (isMobile ? 3 : 5)} ta boshqa
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3 sm:space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Nom yoki SKU bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm sm:text-base"
          />
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Holat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha holatlar</SelectItem>
                  <SelectItem value="active">Faol</SelectItem>
                  <SelectItem value="hidden">Yashirilgan</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Kategoriya" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha kategoriyalar</SelectItem>
                  {getCategories().map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Eng yangilari</SelectItem>
                  <SelectItem value="name">Nom bo'yicha</SelectItem>
                  <SelectItem value="price_low">Narx (pastdan yuqoriga)</SelectItem>
                  <SelectItem value="price_high">Narx (yuqoridan pastga)</SelectItem>
                </SelectContent>
              </Select>

              {!isMobile && (
                <Button variant="outline" size="sm" onClick={handleExportCSV} className="ml-auto">
                  <Download className="w-4 h-4 mr-2" />
                  CSV Export
                </Button>
              )}
            </div>
          )}

          {!isMobile && (
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions - Fixed Bottom (Right Side Only) */}
      {selectedProducts.length > 0 && (
        <div
          className="fixed bottom-4 z-50 transition-all duration-300 ease-in-out"
          style={{
            left: 'var(--sidebar-width, 16rem)',
            right: '1rem',
            transform: 'translateX(0)',
          }}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 p-3 sm:p-4 bg-background border shadow-lg rounded-lg max-w-2xl mx-auto animate-in slide-in-from-bottom-5 duration-300 fade-in">
            <span className="text-xs sm:text-sm font-medium text-center sm:text-left">
              {selectedProducts.length} ta tanlangan
            </span>
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto justify-center sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkActivate}
                className="flex-1 sm:flex-initial text-xs"
              >
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Faollashtirish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDeactivate}
                className="flex-1 sm:flex-initial text-xs"
              >
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Yashirish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="flex-1 sm:flex-initial text-xs"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                O'chirish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUpdatePriceDialogOpen(true)}
                className="flex-1 sm:flex-initial text-xs"
              >
                <Percent className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Narxni o'zgartirish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Products List/Grid */}
      <div>
        {paginatedProducts.length > 0 ? (
          viewMode === 'grid' || isMobile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={selectedProducts.includes(product.id)}
                  onSelect={(checked) => handleSelectProduct(product.id, checked)}
                  onView={() => handleView(product.id)}
                  onEdit={() => handleEdit(product.id)}
                  onDelete={() => handleDelete(product.id)}
                  onStockAdjust={() => handleStockAdjust(product.id)}
                  lowStockThreshold={lowStockThreshold}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-16">Rasm</TableHead>
                    <TableHead>Nomi</TableHead>
                    <TableHead className="hidden sm:table-cell">SKU</TableHead>
                    <TableHead className="hidden md:table-cell">Kategoriya</TableHead>
                    <TableHead>Narx</TableHead>
                    <TableHead>Ombordagi miqdor</TableHead>
                    <TableHead className="hidden lg:table-cell">Holat</TableHead>
                    <TableHead className="text-right">Amal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={(checked) =>
                            handleSelectProduct(product.id, checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full items-center justify-center hidden"
                            style={{ display: product.thumbnail ? 'none' : 'flex' }}
                          >
                            <ImageIcon className="w-4 h-4 sm:w-6 sm:h-6 text-muted-foreground" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm sm:text-base">
                        {product.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs sm:text-sm hidden sm:table-cell">
                        {product.sku}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {product.category}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-sm sm:text-base">
                          {formatNumber(product.price)} so'm
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span
                            className={`text-xs sm:text-sm font-medium ${product.stock > lowStockThreshold
                              ? 'text-green-600'
                              : product.stock > 0
                                ? 'text-yellow-600'
                                : 'text-red-600'
                              }`}
                          >
                            {product.stock > 0
                              ? `${product.stock} dona`
                              : 'Mavjud emas'}
                          </span>
                          {product.stock > 0 && product.stock <= lowStockThreshold && (
                            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStockAdjust(product.id)}
                            className="h-7 w-7 sm:h-8 sm:w-8"
                          >
                            <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <StatusBadge status={product.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleView(product.id)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(product.id)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Package className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Mahsulot topilmadi'
                  : 'Hech qanday mahsulot yo\'q'}
              </EmptyTitle>
              <EmptyDescription>
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Qidiruv yoki filtrlash natijasiga mos mahsulot topilmadi. Boshqa qidiruv so\'zlarini yoki filtrlarni sinab ko\'ring.'
                  : 'Hali hech qanday mahsulot qo\'shilmagan. "Yangi mahsulot" tugmasini bosing va birinchi mahsulotingizni yarating.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      {/* Pagination */}
      {filteredAndSortedProducts.length > 0 && (
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
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              {startIndex + 1}-{Math.min(endIndex, filteredAndSortedProducts.length)} dan{' '}
              {filteredAndSortedProducts.length} ta
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex-1 sm:flex-initial"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="text-xs sm:text-sm">Oldingi</span>
            </Button>
            <span className="text-xs sm:text-sm text-muted-foreground px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex-1 sm:flex-initial"
            >
              <span className="text-xs sm:text-sm">Keyingi</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Update Price Dialog */}
      <Dialog open={updatePriceDialogOpen} onOpenChange={setUpdatePriceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Narxni foiz bo'yicha o'zgartirish</DialogTitle>
            <DialogDescription>
              Tanlangan mahsulotlarning narxini foiz bo'yicha o'zgartiring
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="price-percent">Foiz (%)</Label>
              <Input
                id="price-percent"
                type="number"
                placeholder="Masalan: 10 (10% qo'shish) yoki -5 (5% kamaytirish)"
                value={pricePercent}
                onChange={(e) => setPricePercent(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setUpdatePriceDialogOpen(false);
                setPricePercent('');
              }}
              className="w-full sm:w-auto"
            >
              Bekor qilish
            </Button>
            <Button onClick={handleUpdatePricePercent} className="w-full sm:w-auto">
              O'zgartirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Form Sheet */}
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
      />

      {/* Stock Adjustment Dialog */}
      <StockAdjustment
        open={stockAdjustmentOpen}
        onOpenChange={(open) => {
          setStockAdjustmentOpen(open);
          if (!open) {
            setAdjustingProduct(null);
          }
        }}
        product={adjustingProduct}
        onAdjust={handleStockAdjustment}
      />

      {/* CSV Import Dialog */}
      <CSVImport
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        onImport={handleCSVImport}
      />

      {/* Low Stock Settings Dialog */}
      <LowStockSettings
        open={lowStockSettingsOpen}
        onOpenChange={setLowStockSettingsOpen}
        threshold={lowStockThreshold}
        onSave={handleLowStockSettingsSave}
      />
    </div>
  );
}

export default Products;
