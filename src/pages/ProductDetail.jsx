import ProductForm from '@/components/dashboard/dialogs/ProductForm';
import StockAdjustment from '@/components/dashboard/dialogs/StockAdjustment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatNumber } from '@/lib/utils';
import {
  deleteStoreProduct,
  fetchCategories,
  getStoreProductById,
  updateStoreProduct,
} from '@/services/storeProducts';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit,
  Image as ImageIcon,
  Loader2,
  MoreVertical,
  Package,
  Trash2,
  XCircle,
  ZoomIn,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const { t } = useTranslation();

  const statusConfig = {
    active: {
      label: t('active'),
      variant: 'default',
      icon: CheckCircle2,
      className:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    hidden: {
      label: t('hidden'),
      variant: 'secondary',
      icon: XCircle,
      className:
        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    },
    out_of_stock: {
      label: t('outOfStock'),
      variant: 'destructive',
      icon: AlertTriangle,
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
  };

  const config = statusConfig[status] || statusConfig.active;
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`flex items-center gap-1 w-fit ${config.className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

// Amazon-like Image Carousel Component
const ImageCarousel = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const mainImageRef = useRef(null);
  const isMobile = useIsMobile();
  const thumbnailContainerRef = useRef(null);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-lg border bg-muted flex items-center justify-center">
        <ImageIcon className="h-16 w-16 text-muted-foreground" />
      </div>
    );
  }

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  };

  const handleThumbnailClick = (index) => {
    setSelectedIndex(index);
    setIsZoomed(false);
  };

  const handleImageMouseMove = (e) => {
    if (!isZoomed || isMobile) return;
    const rect = mainImageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const scrollThumbnailIntoView = (index) => {
    if (thumbnailContainerRef.current) {
      const thumbnail = thumbnailContainerRef.current.children[index];
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  };

  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < images.length) {
      scrollThumbnailIntoView(selectedIndex);
    }
  }, [selectedIndex]);

  return (
    <div className="w-full">
      <div
        className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 sm:gap-4`}
      >
        {/* Thumbnails - Left side on desktop, top on mobile */}
        {images.length > 1 && (
          <div
            ref={thumbnailContainerRef}
            className={`flex ${
              isMobile
                ? 'flex-row overflow-x-auto pb-2'
                : 'flex-col overflow-y-auto'
            } gap-2 ${isMobile ? 'w-full' : 'w-20'} ${isMobile ? 'max-h-20' : 'max-h-[500px]'}`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0,0,0,0.2) transparent',
            }}
          >
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === index
                    ? 'border-primary ring-2 ring-primary/20 scale-105'
                    : 'border-muted hover:border-primary/50'
                } ${isMobile ? 'w-16 h-16' : 'w-full aspect-square'}`}
              >
                <img
                  src={image}
                  alt={`${productName} ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                {selectedIndex === index && (
                  <div className="absolute inset-0 bg-primary/10" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Main Image Container */}
        <div className="flex-1 relative">
          <div
            className="relative aspect-square w-full rounded-lg overflow-hidden border bg-muted group cursor-zoom-in"
            onMouseEnter={() => !isMobile && setIsZoomed(true)}
            onMouseLeave={() => !isMobile && setIsZoomed(false)}
            onMouseMove={handleImageMouseMove}
            onClick={() => isMobile && setIsZoomed(!isZoomed)}
            ref={mainImageRef}
          >
            <img
              src={images[selectedIndex]}
              alt={productName}
              className={`w-full h-full object-contain transition-transform duration-300 ${
                isZoomed && !isMobile ? 'scale-150' : 'scale-100'
              }`}
              style={{
                transformOrigin:
                  isZoomed && !isMobile
                    ? `${zoomPosition.x}% ${zoomPosition.y}%`
                    : 'center center',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 hover:bg-background shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 hover:bg-background shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Zoom Indicator */}
            {isZoomed && !isMobile && (
              <div className="absolute top-2 right-2 bg-background/90 px-2 py-1 rounded text-xs flex items-center gap-1">
                <ZoomIn className="h-3 w-3" />
                Zoom
              </div>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/90 px-3 py-1 rounded-full text-xs font-medium shadow-md">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Mobile Zoom Modal */}
          {isMobile && isZoomed && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setIsZoomed(false)}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={images[selectedIndex]}
                  alt={productName}
                  className="max-w-full max-h-full object-contain"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-background/90 hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(false);
                  }}
                >
                  <XCircle className="h-6 w-6" />
                </Button>
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevious();
                      }}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stock Info Card Component
const StockInfoCard = ({ product, onAdjust }) => {
  const { t } = useTranslation();

  const getStockStatus = () => {
    if (product.inStock === 0) {
      return { color: 'text-red-600', label: t('outOfStock'), icon: XCircle };
    }
    if (product.yellowLine && product.inStock <= product.yellowLine) {
      return { color: 'text-yellow-600', label: t('low'), icon: AlertTriangle };
    }
    if (product.redLine && product.inStock <= product.redLine) {
      return {
        color: 'text-red-600',
        label: t('criticallyLow'),
        icon: XCircle,
      };
    }
    return {
      color: 'text-green-600',
      label: t('available'),
      icon: CheckCircle2,
    };
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">
          {t('stockQuantity')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StockIcon className={`h-5 w-5 ${stockStatus.color}`} />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('status')}
              </p>
              <p
                className={`text-sm sm:text-base font-semibold ${stockStatus.color}`}
              >
                {stockStatus.label}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('currentQuantity')}
            </p>
            <p className="font-bold text-xl sm:text-2xl">
              {product.inStock || 0}
            </p>
          </div>
        </div>
        {(product.yellowLine || product.redLine) && (
          <div className="space-y-2">
            {product.yellowLine && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {t('yellowLine')}:
                </span>
                <span className="font-medium">
                  {product.yellowLine} {t('units')}
                </span>
              </div>
            )}
            {product.redLine && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('redLine')}:</span>
                <span className="font-medium text-red-600">
                  {product.redLine} {t('units')}
                </span>
              </div>
            )}
          </div>
        )}
        {(product.yellowLine && product.inStock <= product.yellowLine) ||
        (product.redLine && product.inStock <= product.redLine) ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  {t('lowStock')}
                </p>
                <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-0.5">
                  {product.redLine && product.inStock <= product.redLine
                    ? `${t('criticallyLow')}: ${product.redLine} ${t('units')}`
                    : `${t('lowStockThreshold')}: ${product.yellowLine} ${t('units')}`}
                </p>
              </div>
            </div>
          </div>
        ) : null}
        <Button variant="outline" className="w-full" onClick={onAdjust}>
          <Package className="h-4 w-4" />
          <span className="text-xs sm:text-sm">{t('adjustStockQuantity')}</span>
        </Button>
      </CardContent>
    </Card>
  );
};

function ProductDetail() {
  const { t } = useTranslation();
  const { productId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [stockAdjustmentOpen, setStockAdjustmentOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await getStoreProductById(productId);
        const productData = response?.data || response;

        if (productData) {
          const baseUrl =
            import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
          // Base URL'ni tozalash - trailing slash'ni olib tashlash
          const cleanBaseUrl = baseUrl.replace(/\/$/, '');

          // Helper function to format image URL
          const formatImageUrl = (imageUrl) => {
            if (!imageUrl) return null;
            // Backend'dan kelgan URL: 'uploads/1763466603309.jpeg'
            // ServeStaticModule '/v1/uploads' path'ida serve qiladi
            let url = imageUrl;
            // Agar URL 'uploads/' bilan boshlansa, faqat fayl nomini olish
            if (url.startsWith('uploads/')) {
              url = url.replace('uploads/', '');
            }
            // To'g'ri URL'ni yaratish: baseUrl + /uploads/ + filename
            return `${cleanBaseUrl}/uploads/${url}`;
          };

          // Process images
          const imageUrls = [];
          if (productData.mainImage?.url) {
            const formattedUrl = formatImageUrl(productData.mainImage.url);
            if (formattedUrl) {
              imageUrls.push(formattedUrl);
            }
          }
          if (productData.images && Array.isArray(productData.images)) {
            productData.images.forEach((img) => {
              if (img.url && img._id !== productData.mainImage?._id) {
                const formattedUrl = formatImageUrl(img.url);
                if (formattedUrl) {
                  imageUrls.push(formattedUrl);
                }
              }
            });
          }

          setProduct({
            ...productData,
            imageUrls,
          });
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error(t('productLoadError'));
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        const data = response?.data || response;
        setCategories(data?.data || data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const handleBack = () => navigate('/dashboard/products');
  const handleEdit = () => setEditFormOpen(true);
  const handleStockAdjust = () => setStockAdjustmentOpen(true);

  const handleSaveProduct = async (productData) => {
    try {
      await updateStoreProduct(productData);
      toast.success(t('productUpdated'));
      setEditFormOpen(false);
      // Reload product
      const response = await getStoreProductById(productId);
      const updatedProduct = response?.data || response;
      if (updatedProduct) {
        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
        const cleanBaseUrl = baseUrl.replace('/v1', '');
        const imageUrls = [];
        if (updatedProduct.mainImage?.url) {
          imageUrls.push(
            `${cleanBaseUrl}/uploads/${updatedProduct.mainImage.url}`
          );
        }
        if (updatedProduct.images && Array.isArray(updatedProduct.images)) {
          updatedProduct.images.forEach((img) => {
            if (img.url && img._id !== updatedProduct.mainImage?._id) {
              imageUrls.push(`${cleanBaseUrl}/uploads/${img.url}`);
            }
          });
        }
        setProduct({ ...updatedProduct, imageUrls });
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(t('productUpdateError'));
    }
  };

  const handleStockAdjustment = async (adjustment) => {
    try {
      const newStock = adjustment.newStock;
      await updateStoreProduct({
        _id: product._id,
        inStock: newStock,
      });
      setProduct({ ...product, inStock: newStock });
      toast.success(t('stockQuantityUpdated'));
      setStockAdjustmentOpen(false);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error(t('stockQuantityUpdateError'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStoreProduct(productId);
      toast.success(t('productDeleted'));
      navigate('/dashboard/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(t('productDeleteError'));
    }
  };

  const handleCopySKU = () => {
    if (product?.sku) {
      navigator.clipboard.writeText(product.sku);
      toast.success(t('skuCopied'));
    }
  };

  // Get product name
  const getProductName = (product) => {
    if (!product) return t('product');
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
    if (!categoryId) return t('noCategory');
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
    return t('noCategory');
  };

  const hasDiscount =
    product && product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            {t('productLoading')}...
          </span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">{t('productNotFound')}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {t('productNotExistsOrDeleted')}
        </p>
        <Button onClick={handleBack}>{t('backToProducts')}</Button>
      </div>
    );
  }

  const productName = getProductName(product);

  return (
    <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="title truncate">{productName}</h1>
            <p className="paragraph">
              {product.categoryId
                ? t('category') + ': ' + getCategoryName(product.categoryId)
                : t('noCategory')}{' '}
              • {product.sku ? `SKU: ${product.sku}` : t('skuNotFound')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <MoreVertical className="h-4 w-4" />
                {t('actions')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleStockAdjust}>
                <Package className="h-4 w-4" />
                {t('stockQuantity')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4" />
                {t('edit')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={handleStockAdjust}>
              <Package className="h-4 w-4" />
              {t('stockQuantity')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
              {t('edit')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              {t('delete')}
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Images Gallery - Amazon Style */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <ImageCarousel
                images={product.imageUrls || []}
                productName={productName}
              />
            </CardContent>
          </Card>

          {/* Product Information - Using Tabs */}
          <Tabs
            value={searchParams.get('tab') || 'info'}
            onValueChange={(value) => {
              setSearchParams({ tab: value }, { replace: true });
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info" className="text-xs sm:text-sm">
                {t('information')}
              </TabsTrigger>
              <TabsTrigger value="pricing" className="text-xs sm:text-sm">
                {t('pricingAndDiscounts')}
              </TabsTrigger>
              <TabsTrigger value="stock" className="text-xs sm:text-sm">
                {t('stock')}
              </TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4 sm:space-y-6 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">
                    {t('basicInformation')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">
                        {t('name')} (UZ)
                      </Label>
                      <p className="font-medium text-sm sm:text-base mt-1">
                        {product.name?.uz || '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">
                        {t('name')} (RU)
                      </Label>
                      <p className="font-medium text-sm sm:text-base mt-1">
                        {product.name?.ru || '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">
                        {t('name')} (EN)
                      </Label>
                      <p className="font-medium text-sm sm:text-base mt-1">
                        {product.name?.en || '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">
                        SKU
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-mono text-xs sm:text-sm">
                          {product.sku || '-'}
                        </p>
                        {product.sku && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopySKU}
                            className="h-6 w-6"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">
                        {t('category')}
                      </Label>
                      <p className="font-medium text-sm sm:text-base mt-1">
                        {product.categoryId
                          ? getCategoryName(product.categoryId)
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">
                        {t('status')}
                      </Label>
                      <div className="mt-1">
                        <StatusBadge
                          status={product.isActive ? 'active' : 'hidden'}
                        />
                      </div>
                    </div>
                  </div>

                  {product.description && (
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">
                        {t('description')}
                      </Label>
                      <div
                        className="text-xs sm:text-sm mt-1 whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: product.description || '',
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">
                    {t('pricingAndDiscounts')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">
                        {t('basePrice')}
                      </Label>
                      <p className="font-semibold text-lg sm:text-xl mt-1">
                        {formatNumber(product.price || 0)} {t('currency')}
                      </p>
                    </div>
                    {product.salePrice && product.salePrice < product.price && (
                      <>
                        <div>
                          <Label className="text-xs sm:text-sm text-muted-foreground">
                            {t('discountedPrice')}
                          </Label>
                          <p className="font-semibold text-lg sm:text-xl text-primary mt-1">
                            {formatNumber(product.salePrice)} {t('currency')}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs sm:text-sm text-muted-foreground">
                            {t('discount')}
                          </Label>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="destructive" className="text-sm">
                              -{discountPercent}%
                            </Badge>
                            <span className="text-xs sm:text-sm text-muted-foreground line-through">
                              {formatNumber(product.price)} {t('currency')}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stock Tab */}
            <TabsContent value="stock" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">
                    {t('stockInformation')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm text-muted-foreground">
                        {t('currentStockQuantity')}
                      </Label>
                      <p className="font-bold text-xl sm:text-2xl mt-1">
                        {product.inStock || 0} {t('units')}
                      </p>
                    </div>
                    {product.yellowLine && (
                      <div>
                        <Label className="text-xs sm:text-sm text-muted-foreground">
                          {t('yellowLine')}
                        </Label>
                        <p className="font-semibold text-base sm:text-lg text-yellow-600 mt-1">
                          {product.yellowLine} {t('units')}
                        </p>
                      </div>
                    )}
                    {product.redLine && (
                      <div>
                        <Label className="text-xs sm:text-sm text-muted-foreground">
                          {t('redLine')}
                        </Label>
                        <p className="font-semibold text-base sm:text-lg text-red-600 mt-1">
                          {product.redLine} {t('units')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Stock Information */}
          <StockInfoCard product={product} onAdjust={handleStockAdjust} />

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Statistika</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Yaratilgan
                </span>
                <span className="text-xs sm:text-sm font-medium">
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString('uz-UZ', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '-'}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Yangilangan
                </span>
                <span className="text-xs sm:text-sm font-medium">
                  {product.updatedAt
                    ? new Date(product.updatedAt).toLocaleDateString('uz-UZ', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '-'}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Rasmlar
                </span>
                <span className="text-xs sm:text-sm font-medium">
                  {product.imageUrls?.length || 0} ta
                </span>
              </div>
            </CardContent>
          </Card>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('deleteProduct')}</DialogTitle>
            <DialogDescription>
              {t('deleteProductConfirmation')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              <strong>{productName}</strong> {t('productWillBeDeleted')}.
            </p>
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
              onClick={handleDelete}
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

export default ProductDetail;
