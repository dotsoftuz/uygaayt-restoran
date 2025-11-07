import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Truck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function DeliverySettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(10000);
  const [deliveryRadius, setDeliveryRadius] = useState(5000);
  const [selfPickupEnabled, setSelfPickupEnabled] = useState(true);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Delivery settings saved:', {
        deliveryFee,
        deliveryRadius,
        selfPickupEnabled,
      });
      toast.success('Yetkazib berish sozlamalari saqlandi');
    } catch (error) {
      console.error('Error saving delivery settings:', error);
      toast.error('Ma\'lumotlarni saqlashda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Yetkazib berish to'lovi
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              step="1000"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(parseInt(e.target.value) || 0)}
              className="w-full sm:w-[200px] text-sm sm:text-base"
            />
            <span className="text-xs sm:text-sm text-muted-foreground">so'm</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Har bir yetkazib berish uchun qo'shimcha to'lov
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Yetkazib berish radiusi</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              step="100"
              value={deliveryRadius}
              onChange={(e) => setDeliveryRadius(parseInt(e.target.value) || 0)}
              className="w-full sm:w-[200px] text-sm sm:text-base"
            />
            <span className="text-xs sm:text-sm text-muted-foreground">metr</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Do'kon atrofidagi yetkazib berish radiusi
          </p>
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

      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setDeliveryFee(10000);
            setDeliveryRadius(5000);
            setSelfPickupEnabled(true);
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

export default DeliverySettings;

