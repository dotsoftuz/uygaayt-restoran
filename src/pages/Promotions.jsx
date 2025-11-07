import React, { useState, useMemo } from 'react';
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
import PromotionForm from '@/components/dashboard/dialogs/PromotionForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDate } from '@/lib/utils';
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
const PromotionCard = ({ promotion, onEdit, onDelete, onToggleActive, onCopyCode }) => {
  const formatDiscount = (promo) => {
    if (promo.type === 'percentage') {
      return `${promo.discountValue}%`;
    }
    return `${promo.discountValue.toLocaleString()} so'm`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-semibold text-sm sm:text-base">
                {promotion.code}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => onCopyCode(promotion.code)}
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
          {promotion.firstOrderOnly && (
            <Badge variant="outline" className="text-xs">
              Birinchi buyurtma
            </Badge>
          )}
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
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleActive(promotion.id)}
            className="flex-1 text-xs"
          >
            {promotion.isActive ? (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Yopish
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Faollashtirish
              </>
            )}
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
  onToggleActive,
  onCopyCode,
}) => {
  const formatDiscount = (promo) => {
    if (promo.type === 'percentage') {
      return `${promo.discountValue}%`;
    }
    return `${promo.discountValue.toLocaleString()} so'm`;
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="max-w-[200px]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono font-semibold text-sm sm:text-base truncate">
                {promotion.code}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => onCopyCode(promotion.code)}
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
          {promotion.firstOrderOnly && (
            <Badge variant="outline" className="text-xs">
              Birinchi buyurtma
            </Badge>
          )}
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
              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onToggleActive(promotion.id)}>
                {promotion.isActive ? (
                  <>
                    <XCircle className="h-4 w-4" />
                    Yopish
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Faollashtirish
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(promotion)}>
                <Edit className="h-4 w-4" />
                Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(promotion)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={() => onToggleActive(promotion.id)}
              title={promotion.isActive ? 'Yopish' : 'Faollashtirish'}
            >
              {promotion.isActive ? (
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={() => onEdit(promotion)}
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8"
              onClick={() => onDelete(promotion)}
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
  const [promotions, setPromotions] = useState(generateFakePromotions());
  const [searchTerm, setSearchTerm] = useState('');
  const [promotionFormOpen, setPromotionFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);

  // Filter promotions
  const filteredPromotions = useMemo(() => {
    if (!searchTerm) return promotions;
    return promotions.filter(
      (promo) =>
        promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [promotions, searchTerm]);

  const handleCreateNew = () => {
    setEditingPromotion(null);
    setPromotionFormOpen(true);
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setPromotionFormOpen(true);
  };

  const handleSavePromotion = async (promotionData) => {
    console.log('Saving promotion:', promotionData);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (editingPromotion) {
      setPromotions((prev) =>
        prev.map((promo) =>
          promo.id === editingPromotion.id
            ? { ...promo, ...promotionData, usageCount: promo.usageCount || 0 }
            : promo
        )
      );
      toast.success('Promo kod yangilandi');
    } else {
      const newPromotion = {
        id: `promo-${Date.now()}`,
        ...promotionData,
        usageCount: 0,
      };
      setPromotions((prev) => [...prev, newPromotion]);
      toast.success('Promo kod yaratildi');
    }

    setPromotionFormOpen(false);
    setEditingPromotion(null);
  };

  const handleDelete = (promotion) => {
    setPromotionToDelete(promotion);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (promotionToDelete) {
      setPromotions((prev) =>
        prev.filter((promo) => promo.id !== promotionToDelete.id)
      );
      toast.success('Promo kod o\'chirildi');
    }
    setDeleteDialogOpen(false);
    setPromotionToDelete(null);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Promo kod nusxalandi');
  };

  const handleToggleActive = (promotionId) => {
    setPromotions((prev) =>
      prev.map((promo) =>
        promo.id === promotionId ? { ...promo, isActive: !promo.isActive } : promo
      )
    );
    toast.success('Promo kod holati o\'zgartirildi');
  };

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
                onToggleActive={handleToggleActive}
                onCopyCode={handleCopyCode}
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
                      onToggleActive={handleToggleActive}
                      onCopyCode={handleCopyCode}
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
          setPromotionFormOpen(open);
          if (!open) {
            setEditingPromotion(null);
          }
        }}
        promotion={editingPromotion}
        onSave={handleSavePromotion}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
