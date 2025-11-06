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
import { Label } from '@/components/ui/label';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';
import ProductForm from '@/components/dashboard/dialogs/ProductForm';
import StockAdjustment from '@/components/dashboard/dialogs/StockAdjustment';
import CSVImport from '@/components/dashboard/dialogs/CSVImport';
import LowStockSettings from '@/components/dashboard/dialogs/LowStockSettings';

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

function Products() {
  const navigate = useNavigate();
  const [fakeProducts] = useState(generateFakeProducts());

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

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

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((product) => product.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    // Sort
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
  }, [
    searchTerm,
    statusFilter,
    categoryFilter,
    sortBy,
    itemsPerPage,
  ]);

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

  // Update select all when individual selections change
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
    // navigate(`/dashboard/product-detail/${productId}`);
    console.log('View product:', productId);
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
    // In a real app, this would save to Firebase/database
    console.log('Saving product:', productData);
    // Simulate API call
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
    // In a real app, this would save to Firebase/database
    console.log('Stock adjustment:', adjustment);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update local product stock (in real app, this would come from API)
    // This is just for demo purposes
    toast.success(
      `Ombordagi miqdor ${adjustment.adjustmentType === 'add' ? 'qo\'shildi' : adjustment.adjustmentType === 'remove' ? 'ayirildi' : 'o\'rnatildi'}`
    );
    setStockAdjustmentOpen(false);
    setAdjustingProduct(null);
  };

  const handleCSVImport = async (products) => {
    // In a real app, this would save to Firebase/database
    console.log('Importing products:', products);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(`${products.length} ta mahsulot import qilindi`);
  };

  const handleLowStockSettingsSave = async (settings) => {
    // In a real app, this would save to localStorage or database
    console.log('Saving low stock settings:', settings);
    setLowStockThreshold(settings.threshold);
    // Store in localStorage for persistence
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
    const savedEnabled = localStorage.getItem('lowStockEnabled');
    if (savedThreshold) {
      setLowStockThreshold(parseInt(savedThreshold));
    }
  }, []);

  const handleDelete = (productId) => {
    if (window.confirm("Bu mahsulotni o'chirishni xohlaysizmi?")) {
      toast.success('Mahsulot o\'chirildi');
    }
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? (
      <Badge variant="default" className="flex items-center gap-1 w-fit">
        <CheckCircle2 className="w-3 h-3" />
        Faol
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
        <XCircle className="w-3 h-3" />
        Yashirilgan
      </Badge>
    );
  };

  const getCategories = () => {
    return [...new Set(fakeProducts.map((p) => p.category))];
  };

  return (
    <div className="space-y-4 my-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mahsulotlar</h2>
          <p className="text-muted-foreground">
            Barcha mahsulotlarni ko'rib chiqing va boshqaring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCsvImportOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            CSV Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLowStockSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Sozlamalar
          </Button>
          <Button onClick={handleCreateNew} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Yangi mahsulot
          </Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Past ombordagi miqdor ogohlantirishi
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                {lowStockProducts.length} ta mahsulotning ombordagi miqdori {lowStockThreshold} donadan past
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <Badge
                    key={product.id}
                    variant="outline"
                    className="bg-yellow-100 dark:bg-yellow-900/50 border-yellow-300 dark:border-yellow-700"
                  >
                    {product.name}: {product.stock} dona
                  </Badge>
                ))}
                {lowStockProducts.length > 5 && (
                  <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/50">
                    +{lowStockProducts.length - 5} ta boshqa
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Nom yoki SKU bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Holat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha holatlar</SelectItem>
              <SelectItem value="active">Faol</SelectItem>
              <SelectItem value="hidden">Yashirilgan</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
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

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Eng yangilari</SelectItem>
              <SelectItem value="name">Nom bo'yicha</SelectItem>
              <SelectItem value="price_low">Narx (pastdan yuqoriga)</SelectItem>
              <SelectItem value="price_high">Narx (yuqoridan pastga)</SelectItem>
            </SelectContent>
          </Select>
          {/* Export Button */}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              CSV Export
            </Button>
          </div>

        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedProducts.length} ta tanlangan
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkActivate}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Faollashtirish
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDeactivate}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Yashirish
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              O'chirish
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUpdatePriceDialogOpen(true)}
            >
              <Percent className="w-4 h-4 mr-1" />
              Narxni o'zgartirish
            </Button>
          </div>
        </div>
      )}
      {/* Table */}
      <div>
        {paginatedProducts.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Thumbnail</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock/Availability</TableHead>
                  <TableHead>Status</TableHead>
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
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
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
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {product.sku}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {formatNumber(product.price)} so'm
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            product.stock > lowStockThreshold
                              ? 'text-green-600 font-medium'
                              : product.stock > 0
                                ? 'text-yellow-600 font-medium'
                                : 'text-red-600 font-medium'
                          }
                        >
                          {product.stock > 0
                            ? `${product.stock} dona`
                            : 'Mavjud emas'}
                        </span>
                        {product.stock > 0 && product.stock <= lowStockThreshold && (
                          <TrendingDown className="h-4 w-4 text-yellow-600" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStockAdjust(product.id)}
                          className="ml-2"
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(product.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ko'rish
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Tahrir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Hech qanday mahsulot topilmadi
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredAndSortedProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Sahifada ko'rsatish:
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-[100px]">
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
            <span className="text-sm text-muted-foreground">
              {startIndex + 1}-{Math.min(endIndex, filteredAndSortedProducts.length)} dan{' '}
              {filteredAndSortedProducts.length} ta
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Oldingi
            </Button>
            <span className="text-sm text-muted-foreground">
              Sahifa {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Keyingi
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Update Price Dialog */}
      <Dialog open={updatePriceDialogOpen} onOpenChange={setUpdatePriceDialogOpen}>
        <DialogContent>
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUpdatePriceDialogOpen(false);
                setPricePercent('');
              }}
            >
              Bekor qilish
            </Button>
            <Button onClick={handleUpdatePricePercent}>
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
