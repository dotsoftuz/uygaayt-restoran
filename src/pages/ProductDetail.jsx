import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingDown,
  Plus,
  Minus,
  Eye,
  Loader2,
  Copy,
  Download,
  History,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';
import ProductForm from '@/components/dashboard/dialogs/ProductForm';
import StockAdjustment from '@/components/dashboard/dialogs/StockAdjustment';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Mock product data generator
const generateFakeProduct = (productId) => {
  const categories = ['Ovqat', 'Ichimlik', 'Salat', 'Desert', 'Fast Food'];
  const statuses = ['active', 'hidden', 'out_of_stock'];
  
  return {
    id: productId || 'PROD-000001',
    name: 'Lavash',
    sku: 'SKU-000001',
    category: 'Fast Food',
    price: 35000,
    oldPrice: 40000,
    stock: 45,
    unlimitedStock: false,
    availabilityStatus: 'active',
    description: 'Tovuq go\'shtli, pishloq, pomidor, piyoz va maxsus sous bilan tayyorlangan mazali lavash. Yangi non bilan tayyorlanadi.',
    preparationTime: 15,
    tags: ['tez ovqat', 'mashhur', 'yangi non'],
    images: [
      'https://via.placeholder.com/400x300?text=Lavash+1',
      'https://via.placeholder.com/400x300?text=Lavash+2',
      'https://via.placeholder.com/400x300?text=Lavash+3',
    ],
    variants: [
      {
        id: 'variant_1',
        attributes: { size: 'Kichik', spiceLevel: 'Yengil' },
        price: 30000,
        stock: 20,
        unlimitedStock: false,
      },
      {
        id: 'variant_2',
        attributes: { size: 'O\'rta', spiceLevel: 'O\'rtacha' },
        price: 35000,
        stock: 15,
        unlimitedStock: false,
      },
      {
        id: 'variant_3',
        attributes: { size: 'Katta', spiceLevel: 'Achchiq' },
        price: 40000,
        stock: 10,
        unlimitedStock: false,
      },
    ],
    addOns: ['extra-cheese', 'extra-sauce'],
    visibilitySchedule: {
      type: 'always',
      startDate: null,
      endDate: null,
      recurringHours: [],
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    stockHistory: [
      {
        id: 'adj_1',
        type: 'add',
        quantity: 50,
        reason: 'purchase',
        previousStock: 0,
        newStock: 50,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        notes: 'Yangi xarid',
      },
      {
        id: 'adj_2',
        type: 'remove',
        quantity: 5,
        reason: 'sale',
        previousStock: 50,
        newStock: 45,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        notes: 'Sotilgan',
      },
    ],
  };
};

const availableAddOns = {
  'extra-cheese': 'Qo\'shimcha pishloq',
  'extra-sauce': 'Qo\'shimcha sous',
  'spicy': 'Achchiq',
  'no-onion': 'Piyozsiz',
  'no-garlic': 'Sarimsogsiz',
};

function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [stockAdjustmentOpen, setStockAdjustmentOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lowStockThreshold] = useState(
    parseInt(localStorage.getItem('lowStockThreshold')) || 10
  );

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setProduct(generateFakeProduct(productId));
      setLoading(false);
    }, 500);
  }, [productId]);

  const handleBack = () => {
    navigate('/dashboard/products');
  };

  const handleEdit = () => {
    setEditFormOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    // In a real app, this would save to Firebase/database
    console.log('Saving product:', productData);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setProduct({ ...product, ...productData });
    toast.success('Mahsulot yangilandi');
    setEditFormOpen(false);
  };

  const handleStockAdjust = () => {
    setStockAdjustmentOpen(true);
  };

  const handleStockAdjustment = async (adjustment) => {
    // In a real app, this would save to Firebase/database
    console.log('Stock adjustment:', adjustment);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Update product stock
    const newStock = adjustment.newStock;
    setProduct({
      ...product,
      stock: newStock,
      stockHistory: [
        {
          id: `adj_${Date.now()}`,
          ...adjustment,
          timestamp: new Date(),
        },
        ...product.stockHistory,
      ],
    });
    
    toast.success('Ombordagi miqdor yangilandi');
    setStockAdjustmentOpen(false);
  };

  const handleDelete = () => {
    // In a real app, this would delete from Firebase/database
    toast.success('Mahsulot o\'chirildi');
    navigate('/dashboard/products');
  };

  const handleCopySKU = () => {
    navigator.clipboard.writeText(product.sku);
    toast.success('SKU nusxalandi');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        label: 'Faol',
        variant: 'default',
        icon: CheckCircle2,
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      },
      hidden: {
        label: 'Yashirilgan',
        variant: 'secondary',
        icon: XCircle,
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      },
      out_of_stock: {
        label: 'Tugagan',
        variant: 'destructive',
        icon: AlertTriangle,
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      },
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 w-fit ${config.className}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getStockStatus = () => {
    if (product.unlimitedStock) {
      return { color: 'text-green-600', label: 'Cheksiz', icon: CheckCircle2 };
    }
    if (product.stock === 0) {
      return { color: 'text-red-600', label: 'Tugagan', icon: XCircle };
    }
    if (product.stock <= lowStockThreshold) {
      return { color: 'text-yellow-600', label: 'Past', icon: TrendingDown };
    }
    return { color: 'text-green-600', label: 'Mavjud', icon: CheckCircle2 };
  };

  if (loading) {
    return (
      <div className="space-y-6 my-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span className="text-muted-foreground">Mahsulot yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6 my-4">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Mahsulot topilmadi</h3>
          <p className="text-muted-foreground mb-4">
            Bu mahsulot mavjud emas yoki o'chirilgan
          </p>
          <Button onClick={handleBack}>Mahsulotlar bo'limiga qaytish</Button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="space-y-6 my-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Orqaga
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground mt-1">
              {product.category} • SKU: {product.sku}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleStockAdjust}>
            <Package className="h-4 w-4 mr-2" />
            Ombordagi miqdor
          </Button>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Tahrirlash
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            O'chirish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Rasmlar</CardTitle>
            </CardHeader>
            <CardContent>
              {product.images && product.images.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={product.images[selectedImageIndex]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === index
                              ? 'border-primary'
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video w-full rounded-lg border bg-muted flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Mahsulot ma'lumotlari</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nomi</Label>
                  <p className="font-medium">{product.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">SKU</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm">{product.sku}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopySKU}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Kategoriya</Label>
                  <p className="font-medium">{product.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Holat</Label>
                  <div>{getStatusBadge(product.availabilityStatus)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Narx</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">
                      {formatNumber(product.price)} so'm
                    </p>
                    {hasDiscount && (
                      <>
                        <span className="text-muted-foreground line-through text-sm">
                          {formatNumber(product.oldPrice)} so'm
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          -{discountPercent}%
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                {product.preparationTime && (
                  <div>
                    <Label className="text-muted-foreground">Tayyorlash vaqti</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{product.preparationTime} daqiqa</p>
                    </div>
                  </div>
                )}
              </div>

              {product.description && (
                <div>
                  <Label className="text-muted-foreground">Tavsif</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{product.description}</p>
                </div>
              )}

              {product.tags && product.tags.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Teglar</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Variantlar</CardTitle>
                <CardDescription>
                  Mahsulotning turli xil variantlari va narxlari
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.variants.map((variant, index) => (
                    <div
                      key={variant.id}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Variant {index + 1}
                          </span>
                          <div className="flex gap-2">
                            {Object.entries(variant.attributes).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key === 'size' ? 'O\'lcham' : 'Achchiqlik'}: {value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Narx</p>
                            <p className="font-semibold">
                              {formatNumber(variant.price)} so'm
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Ombordagi miqdor</p>
                            <p className="font-semibold">
                              {variant.unlimitedStock
                                ? 'Cheksiz'
                                : `${variant.stock || 0} dona`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add-ons */}
          {product.addOns && product.addOns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Qo'shimchalar</CardTitle>
                <CardDescription>
                  Bu mahsulot bilan mavjud bo'lgan qo'shimchalar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.addOns.map((addOnId) => (
                    <Badge key={addOnId} variant="outline">
                      {availableAddOns[addOnId] || addOnId}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle>Ombordagi miqdor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StockIcon className={`h-5 w-5 ${stockStatus.color}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">Holat</p>
                    <p className={`font-semibold ${stockStatus.color}`}>
                      {stockStatus.label}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Joriy miqdor</p>
                  <p className="font-bold text-2xl">
                    {product.unlimitedStock ? '∞' : product.stock || 0}
                  </p>
                </div>
              </div>
              {!product.unlimitedStock && product.stock <= lowStockThreshold && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                        Past ombordagi miqdor ogohlantirishi
                      </p>
                      <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
                        Ombordagi miqdor {lowStockThreshold} donadan past
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleStockAdjust}
              >
                <Package className="h-4 w-4 mr-2" />
                Ombordagi miqdorni o'zgartirish
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistika</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Yaratilgan</span>
                <span className="text-sm font-medium">
                  {new Date(product.createdAt).toLocaleDateString('uz-UZ')}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Yangilangan</span>
                <span className="text-sm font-medium">
                  {new Date(product.updatedAt).toLocaleDateString('uz-UZ')}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Variantlar</span>
                <span className="text-sm font-medium">
                  {product.variants?.length || 0} ta
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Qo'shimchalar</span>
                <span className="text-sm font-medium">
                  {product.addOns?.length || 0} ta
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Stock History */}
          {product.stockHistory && product.stockHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Ombordagi miqdor tarixi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {product.stockHistory.slice(0, 10).map((history) => (
                    <div
                      key={history.id}
                      className="flex items-start justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {history.type === 'add' ? (
                            <Plus className="h-4 w-4 text-green-600" />
                          ) : history.type === 'remove' ? (
                            <Minus className="h-4 w-4 text-red-600" />
                          ) : (
                            <Package className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="text-sm font-medium">
                            {history.type === 'add'
                              ? 'Qo\'shildi'
                              : history.type === 'remove'
                              ? 'Ayirildi'
                              : 'O\'rnatildi'}
                            : {history.quantity} dona
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {history.reason === 'purchase'
                            ? 'Yangi xarid'
                            : history.reason === 'sale'
                            ? 'Sotilgan'
                            : history.reason === 'damaged'
                            ? 'Shikastlangan'
                            : history.reason === 'expired'
                            ? 'Muddati o\'tgan'
                            : history.reason === 'inventory'
                            ? 'Inventarizatsiya'
                            : history.reason || 'Boshqa'}
                        </p>
                        {history.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {history.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(history.timestamp).toLocaleString('uz-UZ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Oldin</p>
                        <p className="text-sm font-medium">{history.previousStock}</p>
                        <p className="text-xs text-muted-foreground mt-1">Keyin</p>
                        <p className="text-sm font-medium">{history.newStock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Form */}
      <ProductForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        product={product}
        onSave={handleSaveProduct}
      />

      {/* Stock Adjustment */}
      <StockAdjustment
        open={stockAdjustmentOpen}
        onOpenChange={setStockAdjustmentOpen}
        product={product}
        onAdjust={handleStockAdjustment}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mahsulotni o'chirish</DialogTitle>
            <DialogDescription>
              Bu mahsulotni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              <strong>{product.name}</strong> mahsuloti butunlay o'chiriladi.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProductDetail;

