import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, DollarSign, Gift, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function PaymentMethods() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState({
    cash: { enabled: true, label: 'Naqd pul' },
    card: { enabled: true, label: 'Bank kartasi' },
    bonus: { enabled: false, label: 'Bonus ballar' },
  });

  const handleToggle = (method) => {
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
      console.log('Payment methods saved:', paymentMethods);
      toast.success('To\'lov usullari saqlandi');
    } catch (error) {
      console.error('Error saving payment methods:', error);
      toast.error('Ma\'lumotlarni saqlashda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (method) => {
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
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-3">
        {Object.entries(paymentMethods).map(([key, method]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    {getIcon(key)}
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
                  onCheckedChange={() => handleToggle(key)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
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

export default PaymentMethods;

