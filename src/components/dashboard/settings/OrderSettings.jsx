import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Truck, CreditCard, Loader2, CheckCircle2, XCircle, Star } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

// Helper function to format number with spaces (10 000)
const formatNumber = (value) => {
  if (!value && value !== 0) return '';
  const numStr = String(value).replace(/\s/g, '').replace(/,/g, '');
  if (!numStr) return '';
  const num = parseFloat(numStr);
  if (isNaN(num)) return '';
  return num.toLocaleString('uz-UZ').replace(/,/g, ' ');
};

// Helper function to parse formatted number
const parseNumber = (value) => {
  if (!value) return 0;
  const numStr = String(value).replace(/\s/g, '').replace(/,/g, '');
  const num = parseFloat(numStr);
  return isNaN(num) ? 0 : num;
};

// Validation schema
const deliverySchema = z.object({
  deliveryPrice: z.number().min(0, 'Yetkazib berish narxi 0 dan kichik bo\'lmasligi kerak'),
  orderMinimumPrice: z.number().min(0, 'Minimal buyurtma narxi 0 dan kichik bo\'lmasligi kerak'),
  itemPrepTimeFrom: z.number().min(1, 'Tayyorlanish vaqti 1 dan kichik bo\'lmasligi kerak'),
  itemPrepTimeTo: z.number().min(1, 'Tayyorlanish vaqti 1 dan kichik bo\'lmasligi kerak'),
});

function OrderSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeData, setStoreData] = useState(null);
  const [originalStoreData, setOriginalStoreData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Delivery form
  const deliveryForm = useForm({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      deliveryPrice: 0,
      orderMinimumPrice: 0,
      itemPrepTimeFrom: 10,
      itemPrepTimeTo: 15,
    },
  });

  // Payment and status states
  const [paymentMethods, setPaymentMethods] = useState({
    acceptCash: false,
    acceptCard: false,
    acceptOnlinePayment: false,
  });

  const [statusFlags, setStatusFlags] = useState({
    isActive: true,
    isVerified: false,
    isPremium: false,
  });

  // Fetch store data
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const storeDataStr = localStorage.getItem('storeData');
        if (storeDataStr) {
          const cachedData = JSON.parse(storeDataStr);
          if (cachedData && Object.keys(cachedData).length > 0) {
            setStoreData(cachedData);
            setOriginalStoreData(JSON.parse(JSON.stringify(cachedData)));
            populateForms(cachedData);
          }
        }

        const response = await api.get('/store/get');
        const data = response?.data || response;

        if (data) {
          setStoreData(data);
          setOriginalStoreData(JSON.parse(JSON.stringify(data)));
          populateForms(data);
          localStorage.setItem('storeData', JSON.stringify(data));
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
      }
    };

    fetchStoreData();
  }, []);

  const populateForms = (data) => {
    // Delivery
    deliveryForm.reset({
      deliveryPrice: data.deliveryPrice || 0,
      orderMinimumPrice: data.orderMinimumPrice || 0,
      itemPrepTimeFrom: data.itemPrepTimeFrom || 10,
      itemPrepTimeTo: data.itemPrepTimeTo || 15,
    });

    // Payment methods
    setPaymentMethods({
      acceptCash: data.acceptCash || false,
      acceptCard: data.acceptCard || false,
      acceptOnlinePayment: data.acceptOnlinePayment || false,
    });

    // Status flags
    setStatusFlags({
      isActive: data.isActive !== undefined ? data.isActive : true,
      isVerified: data.isVerified || false,
      isPremium: data.isPremium || false,
    });
  };

  // Check if form has changes
  useEffect(() => {
    if (!originalStoreData) return;

    const deliveryValues = deliveryForm.watch();
    const hasDeliveryChanges =
      deliveryValues.deliveryPrice !== (originalStoreData.deliveryPrice || 0) ||
      deliveryValues.orderMinimumPrice !== (originalStoreData.orderMinimumPrice || 0) ||
      deliveryValues.itemPrepTimeFrom !== (originalStoreData.itemPrepTimeFrom || 10) ||
      deliveryValues.itemPrepTimeTo !== (originalStoreData.itemPrepTimeTo || 15);

    const hasPaymentChanges =
      paymentMethods.acceptCash !== (originalStoreData.acceptCash || false) ||
      paymentMethods.acceptCard !== (originalStoreData.acceptCard || false) ||
      paymentMethods.acceptOnlinePayment !== (originalStoreData.acceptOnlinePayment || false) ||
      statusFlags.isActive !== (originalStoreData.isActive !== undefined ? originalStoreData.isActive : true) ||
      statusFlags.isVerified !== (originalStoreData.isVerified || false) ||
      statusFlags.isPremium !== (originalStoreData.isPremium || false);

    setHasChanges(hasDeliveryChanges || hasPaymentChanges);
  }, [deliveryForm.watch(), paymentMethods, statusFlags, originalStoreData]);

  // Helper function to get current image IDs
  const getCurrentImageIds = () => {
    return {
      logoId: storeData?.logoId || storeData?.logo?._id,
      bannerId: storeData?.bannerId || storeData?.banner?._id,
    };
  };

  // Helper function to preserve images in response
  const preserveImagesInResponse = (responseData, currentData) => {
    const preserved = { ...responseData };
    
    if (currentData?.logo) {
      preserved.logo = currentData.logo;
      preserved.logoId = currentData.logoId || currentData.logo._id;
    }
    
    if (currentData?.banner) {
      preserved.banner = currentData.banner;
      preserved.bannerId = currentData.bannerId || currentData.banner._id;
    }
    
    return preserved;
  };

  // Update original data after successful save
  const updateOriginalData = (updatedData) => {
    const mergedData = { ...originalStoreData, ...updatedData };
    const preservedData = preserveImagesInResponse(mergedData, originalStoreData);
    setOriginalStoreData(JSON.parse(JSON.stringify(preservedData)));
    setStoreData(preservedData);
    localStorage.setItem('storeData', JSON.stringify(preservedData));
    window.dispatchEvent(new Event('localStorageChange'));
  };

  const handleSaveAll = async () => {
    setIsSubmitting(true);
    try {
      const { logoId, bannerId } = getCurrentImageIds();
      const deliveryData = deliveryForm.getValues();

      // Barcha ma'lumotlarni bitta API chaqiruvida yuborish
      const updateData = {
        _id: storeData?._id,
        name: storeData?.name || '',
        phoneNumber: storeData?.phoneNumber || '',
        workTime: storeData?.workTime || '08:00-20:00',
        deliveryPrice: deliveryData.deliveryPrice || 0,
        orderMinimumPrice: deliveryData.orderMinimumPrice || 0,
        itemPrepTimeFrom: deliveryData.itemPrepTimeFrom || 10,
        itemPrepTimeTo: deliveryData.itemPrepTimeTo || 15,
        acceptCash: paymentMethods.acceptCash,
        acceptCard: paymentMethods.acceptCard,
        acceptOnlinePayment: paymentMethods.acceptOnlinePayment,
        isActive: statusFlags.isActive,
        isVerified: statusFlags.isVerified,
        isPremium: statusFlags.isPremium,
        ...(logoId && { logoId }),
        ...(bannerId && { bannerId }),
      };

      const response = await api.put('/store/update', updateData);
      const updatedStoreData = response?.data || response || updateData;
      const updatedWithImages = preserveImagesInResponse(updatedStoreData, storeData);

      updateOriginalData(updatedWithImages);

      // Form'larni yangilash
      deliveryForm.reset({
        deliveryPrice: updatedStoreData.deliveryPrice ?? deliveryData.deliveryPrice,
        orderMinimumPrice: updatedStoreData.orderMinimumPrice ?? deliveryData.orderMinimumPrice,
        itemPrepTimeFrom: updatedStoreData.itemPrepTimeFrom ?? deliveryData.itemPrepTimeFrom,
        itemPrepTimeTo: updatedStoreData.itemPrepTimeTo ?? deliveryData.itemPrepTimeTo,
      });

      if (updatedStoreData.acceptCash !== undefined) {
        setPaymentMethods({
          acceptCash: updatedStoreData.acceptCash || false,
          acceptCard: updatedStoreData.acceptCard || false,
          acceptOnlinePayment: updatedStoreData.acceptOnlinePayment || false,
        });
      }
      if (updatedStoreData.isActive !== undefined) {
        setStatusFlags({
          isActive: updatedStoreData.isActive !== undefined ? updatedStoreData.isActive : true,
          isVerified: updatedStoreData.isVerified || false,
          isPremium: updatedStoreData.isPremium || false,
        });
      }

      setHasChanges(false);
      toast.success('Buyurtma sozlamalari saqlandi');
    } catch (error) {
      console.error('Error updating order settings:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Ma\'lumotlarni saqlashda xatolik yuz berdi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleCancel = () => {
    if (!originalStoreData) return;
    
    deliveryForm.reset({
      deliveryPrice: originalStoreData.deliveryPrice || 0,
      orderMinimumPrice: originalStoreData.orderMinimumPrice || 0,
      itemPrepTimeFrom: originalStoreData.itemPrepTimeFrom || 10,
      itemPrepTimeTo: originalStoreData.itemPrepTimeTo || 15,
    });

    setPaymentMethods({
      acceptCash: originalStoreData.acceptCash || false,
      acceptCard: originalStoreData.acceptCard || false,
      acceptOnlinePayment: originalStoreData.acceptOnlinePayment || false,
    });

    setStatusFlags({
      isActive: originalStoreData.isActive !== undefined ? originalStoreData.isActive : true,
      isVerified: originalStoreData.isVerified || false,
      isPremium: originalStoreData.isPremium || false,
    });

    setHasChanges(false);
    setShowCancelDialog(false);
    toast.success('Barcha o\'zgarishlar bekor qilindi');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Delivery Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Truck className="w-5 h-5" />
          <h2 className="text-lg sm:text-xl font-semibold">Yetkazib berish sozlamalari</h2>
        </div>
        <div className="space-y-6">
        <div className="space-y-4">
            <div className="space-y-2">
              <Label required className="text-xs sm:text-sm">
                Yetkazib berish narxi
              </Label>
          <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={formatNumber(deliveryForm.watch('deliveryPrice') || 0)}
                  onChange={(e) => {
                    const parsed = parseNumber(e.target.value);
                    deliveryForm.setValue('deliveryPrice', parsed, { shouldValidate: true });
                  }}
                  onBlur={(e) => {
                    const parsed = parseNumber(e.target.value);
                    deliveryForm.setValue('deliveryPrice', parsed, { shouldValidate: true });
                  }}
                  className="text-sm sm:text-base"
                  disabled
                  placeholder="0"
                />
                <span className="text-xs sm:text-sm text-muted-foreground">so'm</span>
              </div>
              {deliveryForm.formState.errors.deliveryPrice && (
                <p className="text-xs text-destructive">
                  {deliveryForm.formState.errors.deliveryPrice.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label required className="text-xs sm:text-sm">
                Minimal buyurtma narxi
              </Label>
            <div className="flex items-center gap-2">
              <Input
                  type="text"
                  value={formatNumber(deliveryForm.watch('orderMinimumPrice') || 0)}
                  onChange={(e) => {
                    const parsed = parseNumber(e.target.value);
                    deliveryForm.setValue('orderMinimumPrice', parsed, { shouldValidate: true });
                  }}
                  onBlur={(e) => {
                    const parsed = parseNumber(e.target.value);
                    deliveryForm.setValue('orderMinimumPrice', parsed, { shouldValidate: true });
                  }}
                  className="text-sm sm:text-base"
                  placeholder="0"
              />
              <span className="text-xs sm:text-sm text-muted-foreground">so'm</span>
            </div>
              {deliveryForm.formState.errors.orderMinimumPrice && (
                <p className="text-xs text-destructive">
                  {deliveryForm.formState.errors.orderMinimumPrice.message}
            </p>
              )}
          </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label required className="text-xs sm:text-sm">
                  Tayyorlanish vaqti (dan)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    {...deliveryForm.register('itemPrepTimeFrom', { valueAsNumber: true })}
                    className="text-sm sm:text-base"
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground">daqiqa</span>
                </div>
                {deliveryForm.formState.errors.itemPrepTimeFrom && (
                  <p className="text-xs text-destructive">
                    {deliveryForm.formState.errors.itemPrepTimeFrom.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label required className="text-xs sm:text-sm">
                  Tayyorlanish vaqti (gacha)
                </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                    min="1"
                    {...deliveryForm.register('itemPrepTimeTo', { valueAsNumber: true })}
                    className="text-sm sm:text-base"
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground">daqiqa</span>
                </div>
                {deliveryForm.formState.errors.itemPrepTimeTo && (
                  <p className="text-xs text-destructive">
                    {deliveryForm.formState.errors.itemPrepTimeTo.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Status Section */}
      <div className="space-y-4 pt-6 border-t">
        <div className="flex items-center gap-2 pb-2 border-b">
          <CreditCard className="w-5 h-5" />
          <h2 className="text-lg sm:text-xl font-semibold">To'lov usullari va status</h2>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Naqd pul</Label>
            <p className="text-xs text-muted-foreground">
                      Mijozlar naqd pul bilan to'lov qilishlari mumkin
                    </p>
                  </div>
                </div>
                <Switch
                  checked={paymentMethods.acceptCash}
                  onCheckedChange={(checked) =>
                    setPaymentMethods({ ...paymentMethods, acceptCash: checked })
                  }
                  disabled
                />
          </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Bank kartasi</Label>
                    <p className="text-xs text-muted-foreground">
                      Terminal yoki bank kartasi orqali to'lov
                    </p>
                  </div>
                </div>
                <Switch
                  checked={paymentMethods.acceptCard}
                  onCheckedChange={(checked) =>
                    setPaymentMethods({ ...paymentMethods, acceptCard: checked })
                  }
                  disabled
                />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Onlayn to'lov</Label>
              <p className="text-xs text-muted-foreground">
                      Onlayn to'lov tizimlari orqali to'lov
              </p>
                  </div>
            </div>
            <Switch
                  checked={paymentMethods.acceptOnlinePayment}
                  onCheckedChange={(checked) =>
                    setPaymentMethods({ ...paymentMethods, acceptOnlinePayment: checked })
                  }
                  disabled
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
            <h4 className="text-base sm:text-lg font-semibold">Status</h4>

        <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                  {statusFlags.isActive ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Faol</Label>
                    <p className="text-xs text-muted-foreground">
                      Do'kon faol holatda va buyurtmalarni qabul qiladi
                    </p>
                  </div>
                </div>
                <Switch
                  checked={statusFlags.isActive}
                  onCheckedChange={(checked) =>
                    setStatusFlags({ ...statusFlags, isActive: checked })
                  }
                  disabled
                />
                    </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  {statusFlags.isVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                    <div>
                    <Label className="text-sm sm:text-base font-medium">Tasdiqlangan</Label>
                    <p className="text-xs text-muted-foreground">
                      Do'kon ma'lumotlari tasdiqlangan
                    </p>
                  </div>
                  </div>
                  <Switch
                  checked={statusFlags.isVerified}
                  onCheckedChange={(checked) =>
                    setStatusFlags({ ...statusFlags, isVerified: checked })
                  }
                  disabled
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  {statusFlags.isPremium ? (
                    <Star className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Star className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Label className="text-sm sm:text-base font-medium">Premium</Label>
                    <p className="text-xs text-muted-foreground">
                      Premium do'kon statusi
                    </p>
                  </div>
                </div>
                <Switch
                  checked={statusFlags.isPremium}
                  onCheckedChange={(checked) =>
                    setStatusFlags({ ...statusFlags, isPremium: checked })
                  }
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save and Cancel Buttons - Sticky */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t pt-4 pb-4 mt-8 z-10">
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCancelDialog(true)}
            disabled={!hasChanges || isSubmitting}
            className="text-xs sm:text-sm"
          >
            Bekor qilish
          </Button>
          <Button
            type="button"
            onClick={handleSaveAll}
            disabled={isSubmitting || !hasChanges}
            className="text-xs sm:text-sm"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Saqlash
          </Button>
        </div>
      </div>

      {/* Bekor qilish dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bekor qilish</DialogTitle>
            <DialogDescription>
              Barcha o'zgarishlar bekor qilinadi va asl qiymatlarga qaytadi. Bu amalni bekor qilib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Yopish
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
            >
              Bekor qilish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrderSettings;

