import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  Search,
  MoreVertical,
  Copy,
  CheckCircle2,
  XCircle,
  Calendar,
  TrendingUp,
  Eye,
  EyeOff,
} from 'lucide-react';
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
import PromotionForm from '@/components/dashboard/dialogs/PromotionForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDate } from '@/lib/utils';
import api from '@/services/api';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

// Mock promotions data generator
const generateFakePromotions = () => {
  return [
    {
      id: 'promo-1',
      code: 'WELCOME10',
      type: 'percentage',
      discountValue: 10,
      minOrderValue: 50000,
      validFrom: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      firstOrderOnly: true,
      usageLimitPerUser: 1,
      usageLimitTotal: 100,
      usageCount: 45,
      isActive: true,
      description: 'Yangi mijozlar uchun 10% chegirma',
    },
    {
      id: 'promo-2',
      code: 'SAVE5000',
      type: 'fixed',
      discountValue: 5000,
      minOrderValue: 100000,
      validFrom: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      firstOrderOnly: false,
      usageLimitPerUser: 3,
      usageLimitTotal: 500,
      usageCount: 234,
      isActive: true,
      description: '100,000 so\'mdan yuqori buyurtmalar uchun 5,000 so\'m chegirma',
    },
    {
      id: 'promo-3',
      code: 'SUMMER20',
      type: 'percentage',
      discountValue: 20,
      minOrderValue: null,
      validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      validUntil: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      firstOrderOnly: false,
      usageLimitPerUser: null,
      usageLimitTotal: 1000,
      usageCount: 1000,
      isActive: false,
      description: 'Yozgi aksiya - 20% chegirma',
    },
  ];
};

// Status Badge Component
const StatusBadge = ({ promotion }) => {
  const now = new Date();
  const isExpired = promotion.validUntil < now;
  const isLimitReached =
    promotion.usageLimitTotal &&
    promotion.usageCount >= promotion.usageLimitTotal;

  if (!promotion.isActive) {
    return (
      <Badge variant="secondary" className="text-xs">
        <XCircle className="h-3 w-3 mr-1" />
        Yopilgan
      </Badge>
    );
  }

  if (isExpired) {
    return (
      <Badge variant="destructive" className="text-xs">
        <XCircle className="h-3 w-3 mr-1" />
        Muddati o'tgan
      </Badge>
    );
  }

  if (isLimitReached) {
    return (
      <Badge variant="destructive" className="text-xs">
        <XCircle className="h-3 w-3 mr-1" />
        Cheklovga yetgan
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="text-xs">
      <CheckCircle2 className="h-3 w-3 mr-1" />
      Faol
    </Badge>
  );
};

// Promotion Row Component (Mobile Card View)
const PromotionCard = ({ promotion, onEdit, onDelete, onCopyCode, onViewDetail, onToggleIsShow }) => {
  const formatDiscount = (promo) => {
    if (promo.type === 'percentage') {
      return `${promo.discountValue}%`;
    }
    return `${promo.discountValue.toLocaleString()} so'm`;
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewDetail(promotion)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Banner Image */}
        {promotion.bannerImage?.formattedUrl && (
          <div className="w-full h-32 rounded-lg overflow-hidden -mx-4 -mt-4 mb-2">
            <img
              src={promotion.bannerImage.formattedUrl}
              alt={promotion.code}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="font-mono font-semibold text-sm sm:text-base cursor-pointer hover:text-primary"
                onClick={() => onViewDetail(promotion)}
                title="Batafsil ko'rish"
              >
                {promotion.code}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); onCopyCode(promotion.code); }}
                title="Nusxalash"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            {promotion.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {promotion.description}
              </p>
            )}
          </div>
          <StatusBadge promotion={promotion} />
        </div>

        {/* Discount Info */}
        <div className="flex items-center justify-between py-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Chegirma</p>
            <p className="font-semibold text-primary text-sm">
              {formatDiscount(promotion)}
            </p>
          </div>
          {promotion.minOrderValue && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Minimal buyurtma</p>
              <p className="text-xs font-medium">
                {promotion.minOrderValue.toLocaleString()} so'm
              </p>
            </div>
          )}
        </div>

        {/* Conditions */}
        <div className="space-y-1 text-xs">
          {promotion.usageLimitPerUser && (
            <p className="text-muted-foreground">
              {promotion.usageLimitPerUser} marta/foydalanuvchi
            </p>
          )}
        </div>

        {/* Dates */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(promotion.validFrom)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>→</span>
            <span>{formatDate(promotion.validUntil)}</span>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="flex items-center justify-between py-2 border-t">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Ishlatilgan:</span>
            <span className="text-sm font-medium">
              {promotion.usageCount || 0}
            </span>
            {promotion.usageLimitTotal && (
              <span className="text-xs text-muted-foreground">
                / {promotion.usageLimitTotal}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleIsShow(promotion)}
            className="flex-1 text-xs"
            title={promotion.isShow ? "Banner yashirish" : "Banner ko'rsatish"}
          >
            {promotion.isShow ? "Yashirish" : "Ko'rsatish"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(promotion)}
            className="flex-1 text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Tahrirlash
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(promotion)}
            className="text-destructive text-xs"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Promotion Table Row Component
const PromotionTableRow = ({
  promotion,
  isMobile,
  onEdit,
  onDelete,
  onCopyCode,
  onToggleIsShow,
  onViewDetail,
}) => {
  const formatDiscount = (promo) => {
    if (promo.type === 'percentage') {
      return `${promo.discountValue}%`;
    }
    return `${promo.discountValue.toLocaleString()} so'm`;
  };

  return (
    <TableRow
      className="hover:bg-muted/50 cursor-pointer"
      onClick={() => onViewDetail(promotion)}
    >
      <TableCell className="max-w-[200px]">
        <div className="flex items-center gap-2 min-w-0">
          {promotion.bannerImage?.formattedUrl && (
            <div className="w-16 h-10 flex-shrink-0 rounded overflow-hidden cursor-pointer" onClick={() => onViewDetail(promotion)}>
              <img
                src={promotion.bannerImage.formattedUrl}
                alt={promotion.code}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="font-mono font-semibold text-sm sm:text-base truncate cursor-pointer hover:text-primary"
                onClick={() => onViewDetail(promotion)}
                title="Batafsil ko'rish"
              >
                {promotion.code}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); onCopyCode(promotion.code); }}
                title="Nusxalash"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            {promotion.description && (
              <p className="text-xs text-muted-foreground truncate mt-1 max-w-full">
                {promotion.description}
              </p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell max-w-[150px]">
        <div className="space-y-1">
          <span className="font-semibold text-primary text-sm">
            {formatDiscount(promotion)}
          </span>
          {promotion.minOrderValue && (
            <p className="text-xs text-muted-foreground truncate">
              Min: {promotion.minOrderValue.toLocaleString()} so'm
            </p>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell max-w-[180px]">
        <div className="space-y-1 text-xs">
          {promotion.usageLimitPerUser && (
            <p className="text-muted-foreground truncate">
              {promotion.usageLimitPerUser} marta/foydalanuvchi
            </p>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell max-w-[200px]">
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground truncate">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{formatDate(promotion.validFrom)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground truncate">
            <span className="flex-shrink-0">→</span>
            <span className="truncate">{formatDate(promotion.validUntil)}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell text-center max-w-[120px]">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium">
              {promotion.usageCount || 0}
            </span>
          </div>
          {promotion.usageLimitTotal && (
            <span className="text-xs text-muted-foreground">
              / {promotion.usageLimitTotal}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right max-w-[120px]">
        <div className="flex justify-end">
          <StatusBadge promotion={promotion} />
        </div>
      </TableCell>
      <TableCell className="text-right max-w-[140px]">
        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(promotion); }}>
                <Edit className="h-4 w-4" />
                Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onToggleIsShow(promotion); }}
              >
                {promotion.isShow ? "Banner yashirish" : "Banner ko'rsatish"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(promotion); }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={(e) => { e.stopPropagation(); onEdit(promotion); }}
              title="Tahrirlash"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={(e) => { e.stopPropagation(); onDelete(promotion); }}
              title="O'chirish"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

function Promotions() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [promotions, setPromotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [promotionFormOpen, setPromotionFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const justSavedRef = useRef(false);

  // Filter promotions
  const filteredPromotions = useMemo(() => {
    if (!debouncedSearchTerm) return promotions;
    return promotions.filter(
      (promo) =>
        promo.code.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        promo.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [promotions, debouncedSearchTerm]);

  const handleCreateNew = () => {
    // Yangi promocode qo'shishda editingPromotion ni null qilish va formni reset qilish
    setEditingPromotion(null);
    setSearchParams({ drawer: 'create-promotion' });
    // Kichik kechikish bilan form ochish - bu form reset qilishga imkon beradi
    setTimeout(() => {
      setPromotionFormOpen(true);
    }, 0);
  };

  const handleEdit = async (promotion) => {
    // Fetch full promotion data with banner image
    try {
      const response = await api.get(`/store/promocode/get-by-id/${promotion.id}`);
      const fullPromotion = response?.data || response;

      // Map to form format
      const mappedPromotion = {
        ...promotion,
        name: fullPromotion.name || promotion.name || '',
        code: fullPromotion.code || promotion.code || '',
        discountValue: fullPromotion.amount || promotion.discountValue,
        minOrderValue: fullPromotion.minOrderPrice ?? promotion.minOrderValue ?? 0,
        validFrom: fullPromotion.fromDate ? new Date(fullPromotion.fromDate) : promotion.validFrom,
        validUntil: fullPromotion.toDate ? new Date(fullPromotion.toDate) : promotion.validUntil,
        usageLimitPerUser: fullPromotion.maxUsageForUser ?? promotion.usageLimitPerUser ?? 1,
        usageLimitTotal: fullPromotion.maxUsage ?? promotion.usageLimitTotal ?? 1,
        description: fullPromotion.description || promotion.description || '',
        bannerImageId: fullPromotion.bannerImageId || promotion.bannerImageId || null,
        bannerImage: fullPromotion.bannerImage ? {
          _id: fullPromotion.bannerImage._id,
          url: fullPromotion.bannerImage.url,
          formattedUrl: formatImageUrl(fullPromotion.bannerImage.url),
        } : promotion.bannerImage || null,
      };

      setEditingPromotion(mappedPromotion);
      setPromotionFormOpen(true);
    } catch (error) {
      console.error('Error fetching promotion details:', error);
      // Fallback to existing promotion data
      setEditingPromotion(promotion);
      setPromotionFormOpen(true);
    }
  };

  // Fetch promotions from backend
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await api.post('/store/promocode/paging', {
        page: 1,
        limit: 100,
        search: debouncedSearchTerm || undefined,
      });

      // Backend paging response structure: { data: { total: number, data: [...] } }
      // API interceptor returns response.data, so response should be { total: number, data: [...] }
      // But sometimes interceptor might not work, so we handle both cases
      console.log('Promotions API Response:', response);

      // Handle different response structures
      let promotionsList = [];

      // Case 1: Interceptor didn't work - full response with statusCode
      if (response?.data?.data && Array.isArray(response.data.data)) {
        // Structure: { statusCode: 200, data: { total: 2, data: [...] } }
        promotionsList = response.data.data;
        console.log('Using response.data.data (interceptor not working)');
      }
      // Case 2: Interceptor worked - response.data is the paging result
      else if (response?.data && Array.isArray(response.data)) {
        // Structure: { total: 2, data: [...] } (after interceptor)
        promotionsList = response.data;
        console.log('Using response.data (interceptor worked)');
      }
      // Case 3: Response is directly an array (shouldn't happen)
      else if (Array.isArray(response)) {
        promotionsList = response;
        console.log('Using response directly (array)');
      }
      // Case 4: Try nested structure one more time
      else if (response?.data?.data) {
        promotionsList = Array.isArray(response.data.data) ? response.data.data : [];
        console.log('Using response.data.data (fallback)');
      }

      console.log('Promotions List:', promotionsList, 'Count:', promotionsList.length);

      // Helper function to format image URL
      const formatImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
        const cleanBaseUrl = baseUrl.replace(/\/$/, '');
        let url = imageUrl;
        if (url.startsWith('uploads/')) {
          url = url.replace('uploads/', '');
        }
        return `${cleanBaseUrl}/uploads/${url}`;
      };

      // Map backend data to frontend format
      const mappedPromotions = (Array.isArray(promotionsList) ? promotionsList : []).map((promo) => ({
        id: promo._id,
        code: promo.code,
        name: promo.name,
        amount: promo.amount,
        minOrderPrice: promo.minOrderPrice || 0,
        fromDate: promo.fromDate ? new Date(promo.fromDate) : null,
        toDate: promo.toDate ? new Date(promo.toDate) : null,
        maxUsage: promo.maxUsage,
        maxUsageForUser: promo.maxUsageForUser || 1,
        usedCount: promo.usedCount || 0,
        isActive: promo.state === 'active',
        description: promo.description || '',
        bannerImageId: promo.bannerImageId || null,
        bannerImage: promo.bannerImage ? {
          _id: promo.bannerImage._id,
          url: promo.bannerImage.url,
          formattedUrl: formatImageUrl(promo.bannerImage.url),
        } : null,
        // Map for form compatibility
        discountValue: promo.amount,
        minOrderValue: promo.minOrderPrice || 0,
        validFrom: promo.fromDate ? new Date(promo.fromDate) : new Date(),
        validUntil: promo.toDate ? new Date(promo.toDate) : new Date(),
        usageLimitTotal: promo.maxUsage,
        usageLimitPerUser: promo.maxUsageForUser || 1,
      }));

      setPromotions(mappedPromotions);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Promokodlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [debouncedSearchTerm]);

  const handleSavePromotion = async (promotionData) => {
    try {
      // Map form data to backend DTO format
      const backendData = {
        name: promotionData.name || promotionData.code || 'Promo kod',
        code: promotionData.code,
        amount: promotionData.discountValue || promotionData.amount,
        fromDate: promotionData.validFrom || promotionData.fromDate,
        toDate: promotionData.validUntil || promotionData.toDate,
      };

      // Only include minOrderPrice if it's a positive number
      const minOrderValue = promotionData.minOrderValue ?? promotionData.minOrderPrice;
      if (minOrderValue != null && minOrderValue > 0) {
        backendData.minOrderPrice = minOrderValue;
      }

      // Only include maxUsage if it's a positive number
      const usageLimitTotal = promotionData.usageLimitTotal ?? promotionData.maxUsage;
      if (usageLimitTotal != null && usageLimitTotal > 0) {
        backendData.maxUsage = usageLimitTotal;
      }

      // Only include maxUsageForUser if it's a positive number
      const usageLimitPerUser = promotionData.usageLimitPerUser ?? promotionData.maxUsageForUser;
      if (usageLimitPerUser != null && usageLimitPerUser > 0) {
        backendData.maxUsageForUser = usageLimitPerUser;
      }

      // Include description if provided
      if (promotionData.description && promotionData.description.trim()) {
        backendData.description = promotionData.description.trim();
      }

      // Include bannerImageId if provided
      if (promotionData.bannerImageId) {
        backendData.bannerImageId = promotionData.bannerImageId;
      }

      // Include isShow if provided
      if (promotionData.isShow !== undefined && promotionData.isShow !== null) {
        backendData.isShow = promotionData.isShow;
      }

      if (editingPromotion) {
        await api.put('/store/promocode/update', {
          _id: editingPromotion.id,
          ...backendData,
        });
        toast.success('Promo kod yangilandi');
      } else {
        await api.post('/store/promocode/create', backendData);
        toast.success('Promo kod yaratildi');
      }

      // Close form and reset editing promotion FIRST
      setEditingPromotion(null);
      setPromotionFormOpen(false);

      // Mark that we just saved to prevent sheet from reopening
      justSavedRef.current = true;

      // Remove drawer parameter from URL to prevent sheet from reopening
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('drawer');
      setSearchParams(newParams, { replace: true });

      // Refresh promotions list after closing
      await fetchPromotions();

      // Reset the flag after a short delay to allow URL updates to complete
      setTimeout(() => {
        justSavedRef.current = false;
      }, 100);
    } catch (error) {
      console.error('Error saving promotion:', error);

      // Handle validation errors
      if (error?.data && Array.isArray(error.data)) {
        const validationMessages = error.data.map(err => err.message || `${err.property}: ${err.message}`).join(', ');
        toast.error(`Validatsiya xatosi: ${validationMessages}`);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error('Promo kodni saqlashda xatolik yuz berdi');
      }
    }
  };

  const handleToggleIsShow = async (promotion) => {
    try {
      const newIsShow = !promotion.isShow;

      // Fetch current promotion data first to ensure we have all fields
      const response = await api.get(`/store/promocode/get-by-id/${promotion.id}`);
      const currentPromo = response?.data || response;

      // Update only the isShow field
      await api.put(`/store/promocode/update`, {
        _id: promotion.id,
        name: currentPromo.name || promotion.name,
        code: currentPromo.code || promotion.code,
        amount: currentPromo.amount || promotion.amount || promotion.discountValue,
        minOrderPrice: currentPromo.minOrderPrice ?? promotion.minOrderPrice ?? promotion.minOrderValue ?? 0,
        fromDate: currentPromo.fromDate || promotion.fromDate || promotion.validFrom,
        toDate: currentPromo.toDate || promotion.toDate || promotion.validUntil,
        maxUsage: currentPromo.maxUsage || promotion.maxUsage || promotion.usageLimitTotal,
        maxUsageForUser: currentPromo.maxUsageForUser ?? promotion.maxUsageForUser ?? promotion.usageLimitPerUser ?? 1,
        description: currentPromo.description || promotion.description || '',
        bannerImageId: currentPromo.bannerImageId || promotion.bannerImageId || null,
        state: currentPromo.state || (promotion.isActive ? 'active' : 'inactive'),
        isShow: newIsShow,
      });
      toast.success(`Banner ko'rsatish ${newIsShow ? 'yoqildi' : 'o\'chirildi'}`);
      await fetchPromotions();
    } catch (error) {
      console.error('Error toggling isShow:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Banner ko\'rsatishni o\'zgartirishda xatolik yuz berdi');
    }
  };

  const handleDelete = (promotion) => {
    setPromotionToDelete(promotion);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (promotionToDelete) {
      try {
        await api.delete(`/store/promocode/delete/${promotionToDelete.id}`);
        toast.success('Promo kod o\'chirildi');
        await fetchPromotions();
      } catch (error) {
        console.error('Error deleting promotion:', error);
        toast.error(error?.message || 'Promo kodni o\'chirishda xatolik yuz berdi');
      }
    }
    setDeleteDialogOpen(false);
    setPromotionToDelete(null);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Promo kod nusxalandi');
  };

  const handleViewDetail = (promotion) => {
    navigate(`/dashboard/promotion-detail/${promotion.id}`);
  };

  // Watch for URL parameter to open drawer and dialogs
  useEffect(() => {
    const drawer = searchParams.get('drawer');
    const dialog = searchParams.get('dialog');
    const promotionId = searchParams.get('promotionId');

    // Agar biz yangi promo kod qo'shgan bo'lsak, sheetni qayta ochmaslik
    if (justSavedRef.current) {
      return;
    }

    // Faqat sheet yopiq bo'lganda ochish (agar ochiq bo'lsa, qayta ochmaslik)
    if (drawer === 'create-promotion' && !promotionFormOpen) {
      setEditingPromotion(null);
      setPromotionFormOpen(true);
    }

    if (dialog === 'delete-promotion' && promotionId) {
      const promotion = promotions.find(p => p.id === promotionId);
      if (promotion) {
        setPromotionToDelete(promotion);
        setDeleteDialogOpen(true);
      }
    }
  }, [searchParams, promotions, promotionFormOpen]);

  // Read search from URL on mount
  useEffect(() => {
    const search = searchParams.get('search');
    if (search !== null) setSearchTerm(search);
  }, []); // Only on mount

  // Update URL when search changes (using debounced search)
  useEffect(() => {
    // Agar biz yangi promo kod qo'shgan bo'lsak, drawer parametrini qo'shmaslik
    if (justSavedRef.current) {
      return;
    }

    const params = new URLSearchParams();

    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);

    // Preserve drawer parameter if exists (but only if we didn't just save)
    const drawer = searchParams.get('drawer');
    if (drawer && !justSavedRef.current) {
      params.set('drawer', drawer);
    }

    setSearchParams(params, { replace: true });
  }, [debouncedSearchTerm, searchParams]);

  return (
    <div className="space-y-4 py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="title">Promo kodlar / Chegirmalar</h2>
          <p className="paragraph">
            Promo kodlar va chegirmalarni boshqaring
          </p>
        </div>
        <Button onClick={handleCreateNew} size="sm" className="h-10 sm:h-9 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Yangi promo kod</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Promo kod yoki tavsif bo'yicha qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-sm sm:text-base"
        />
      </div>

      {/* Promotions List */}
      {filteredPromotions.length > 0 ? (
        isMobile ? (
          // Mobile Card View
          <div className="space-y-3">
            {filteredPromotions.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCopyCode={handleCopyCode}
                onViewDetail={handleViewDetail}
                onToggleIsShow={handleToggleIsShow}
              />
            ))}
          </div>
        ) : (
          // Desktop Table View
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px] min-w-[180px]">Promo kod</TableHead>
                    <TableHead className="hidden sm:table-cell w-[150px] min-w-[120px]">Chegirma</TableHead>
                    <TableHead className="hidden md:table-cell w-[180px] min-w-[150px]">Shartlar</TableHead>
                    <TableHead className="hidden lg:table-cell w-[200px] min-w-[180px]">Muddati</TableHead>
                    <TableHead className="hidden md:table-cell text-center w-[120px] min-w-[100px]">
                      Ishlatilgan
                    </TableHead>
                    <TableHead className="text-right w-[120px] min-w-[100px]">Holat</TableHead>
                    <TableHead className="text-right w-[140px] min-w-[120px]">Amal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromotions.map((promotion) => (
                    <PromotionTableRow
                      key={promotion.id}
                      promotion={promotion}
                      isMobile={isMobile}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onCopyCode={handleCopyCode}
                      onViewDetail={handleViewDetail}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Tag className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>
              {searchTerm
                ? 'Promo kod topilmadi'
                : 'Hech qanday promo kod yo\'q'}
            </EmptyTitle>
            <EmptyDescription>
              {searchTerm
                ? 'Qidiruv natijasiga mos promo kod topilmadi. Boshqa qidiruv so\'zlarini sinab ko\'ring.'
                : 'Hali hech qanday promo kod yaratilmagan. "Yangi promo kod" tugmasini bosing va birinchi promo kodingizni yarating.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* Promotion Form */}
      <PromotionForm
        open={promotionFormOpen}
        onOpenChange={(open) => {
          // Only update if state actually changed to prevent double calls
          if (open !== promotionFormOpen) {
            setPromotionFormOpen(open);
            if (!open) {
              setEditingPromotion(null);
              // Remove drawer parameter from URL when closing
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('drawer');
              setSearchParams(newParams, { replace: true });
              // Reset the flag when manually closing
              justSavedRef.current = false;
            }
          }
        }}
        promotion={editingPromotion}
        onSave={handleSavePromotion}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          const params = new URLSearchParams(searchParams);
          if (open) {
            params.set('dialog', 'delete-promotion');
            if (promotionToDelete) {
              params.set('promotionId', promotionToDelete.id);
            }
          } else {
            params.delete('dialog');
            params.delete('promotionId');
          }
          setSearchParams(params, { replace: true });
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Promo kodni o'chirish</DialogTitle>
            <DialogDescription>
              Bu promo kodni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {promotionToDelete && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong className="font-mono">{promotionToDelete.code}</strong> promo kodi
                  butunlay o'chiriladi.
                </p>
                {promotionToDelete.usageCount > 0 && (
                  <p className="text-sm text-yellow-600">
                    Ushbu promo kod {promotionToDelete.usageCount} marta ishlatilgan.
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

export default Promotions;
