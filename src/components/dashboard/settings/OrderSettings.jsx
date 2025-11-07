import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Truck, CreditCard, DollarSign, Gift, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function OrderSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(10000);
  const [deliveryRadius, setDeliveryRadius] = useState(5000);
  const [selfPickupEnabled, setSelfPickupEnabled] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState({
    cash: { enabled: true, label: 'Naqd pul' },
    card: { enabled: true, label: 'Bank kartasi' },
    bonus: { enabled: false, label: 'Bonus ballar' },
  });

  const handlePaymentToggle = (method) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [method]: {
        ...prev[method],
        enabled: !prev[method].enabled,
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Order settings saved:', {
        deliveryFee,
        deliveryRadius,
        selfPickupEnabled,
        paymentMethods,
      });
      toast.success('Buyurtma sozlamalari saqlandi');
    } catch (error) {
      console.error('Error saving order settings:', error);
      toast.error('Ma\'lumotlarni saqlashda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="w-5 h-5" />;
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      case 'bonus':
        return <Gift className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Delivery Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          <h3 className="text-base sm:text-lg font-semibold">Yetkazib berish sozlamalari</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
          <div className="space-y-2 w-full">
            <Label className="text-xs sm:text-sm">Yetkazib berish to'lovi</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                step="1000"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(parseInt(e.target.value) || 0)}
                className="w-full sm:w-full text-sm sm:text-base"
              />
              <span className="text-xs sm:text-sm text-muted-foreground">so'm</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Har bir yetkazib berish uchun qo'shimcha to'lov
            </p>
          </div>

          <div className="space-y-2 w-full">
            <Label className="text-xs sm:text-sm">Yetkazib berish radiusi</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                step="100"
                value={deliveryRadius}
                onChange={(e) => setDeliveryRadius(parseInt(e.target.value) || 0)}
                className="w-full sm:w-full text-sm sm:text-base"
              />
              <span className="text-xs sm:text-sm text-muted-foreground">metr</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Do'kon atrofidagi yetkazib berish radiusi
            </p>
          </div>

          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-xs sm:text-sm">O'z-o'zidan olib ketish</Label>
              <p className="text-xs text-muted-foreground">
                Mijozlar o'z-o'zidan olib ketish imkoniyatiga ega bo'ladi
              </p>
            </div>
            <Switch
              checked={selfPickupEnabled}
              onCheckedChange={setSelfPickupEnabled}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Payment Methods */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          <h3 className="text-base sm:text-lg font-semibold">To'lov usullari</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(paymentMethods).map(([key, method]) => (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      {getPaymentIcon(key)}
                    </div>
                    <div>
                      <CardTitle className="text-sm sm:text-base">{method.label}</CardTitle>
                      <CardDescription className="text-xs">
                        {key === 'cash' && 'Naqd pul bilan to\'lov'}
                        {key === 'card' && 'Bank kartasi yoki terminal orqali to\'lov'}
                        {key === 'bonus' && 'Bonus ballar bilan to\'lov'}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={method.enabled}
                    onCheckedChange={() => handlePaymentToggle(key)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setDeliveryFee(10000);
            setDeliveryRadius(5000);
            setSelfPickupEnabled(true);
            setPaymentMethods({
              cash: { enabled: true, label: 'Naqd pul' },
              card: { enabled: true, label: 'Bank kartasi' },
              bonus: { enabled: false, label: 'Bonus ballar' },
            });
          }}
          className="text-xs sm:text-sm"
        >
          Bekor qilish
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="text-xs sm:text-sm">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Saqlash
        </Button>
      </div>
    </div>
  );
}

export default OrderSettings;

