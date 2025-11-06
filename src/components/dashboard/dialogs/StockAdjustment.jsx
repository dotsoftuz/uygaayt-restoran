import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Minus, Loader2 } from 'lucide-react';

const adjustmentSchema = z.object({
  adjustmentType: z.enum(['add', 'remove', 'set']),
  quantity: z.number().min(0.01, 'Miqdor 0 dan katta bo\'lishi kerak'),
  reason: z.string().min(1, 'Sabab majburiy'),
  notes: z.string().optional(),
});

const adjustmentReasons = {
  add: [
    { value: 'purchase', label: 'Yangi xarid' },
    { value: 'return', label: 'Qaytarilgan mahsulot' },
    { value: 'correction', label: 'Xatolik tuzatish' },
    { value: 'transfer_in', label: 'Boshqa ombordan ko\'chirish' },
    { value: 'other', label: 'Boshqa' },
  ],
  remove: [
    { value: 'sale', label: 'Sotilgan' },
    { value: 'damaged', label: 'Shikastlangan' },
    { value: 'expired', label: 'Muddati o\'tgan' },
    { value: 'theft', label: 'O\'g\'irlik' },
    { value: 'transfer_out', label: 'Boshqa omborga ko\'chirish' },
    { value: 'other', label: 'Boshqa' },
  ],
  set: [
    { value: 'inventory', label: 'Inventarizatsiya' },
    { value: 'correction', label: 'Xatolik tuzatish' },
    { value: 'recount', label: 'Qayta hisoblash' },
    { value: 'other', label: 'Boshqa' },
  ],
};

function StockAdjustment({ open, onOpenChange, product, onAdjust }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      adjustmentType: 'add',
      quantity: 0,
      reason: '',
      notes: '',
    },
  });

  const adjustmentType = form.watch('adjustmentType');

  React.useEffect(() => {
    if (open && product) {
      form.reset({
        adjustmentType: 'add',
        quantity: 0,
        reason: '',
        notes: '',
      });
    }
  }, [open, product, form]);

  const onSubmit = async (data) => {
    if (!product) return;

    setIsSubmitting(true);
    try {
      const adjustment = {
        productId: product.id,
        productName: product.name,
        adjustmentType: data.adjustmentType,
        quantity: data.quantity,
        reason: data.reason,
        notes: data.notes || '',
        previousStock: product.stock || 0,
        timestamp: new Date().toISOString(),
      };

      // Calculate new stock
      let newStock = product.stock || 0;
      if (data.adjustmentType === 'add') {
        newStock += data.quantity;
      } else if (data.adjustmentType === 'remove') {
        newStock = Math.max(0, newStock - data.quantity);
      } else if (data.adjustmentType === 'set') {
        newStock = data.quantity;
      }

      adjustment.newStock = newStock;

      await onAdjust(adjustment);
      toast.success('Ombordagi miqdor yangilandi');
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Ombordagi miqdorni yangilashda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  const currentStock = product.stock || 0;
  const previewStock = (() => {
    const quantity = form.watch('quantity') || 0;
    const type = form.watch('adjustmentType');
    if (type === 'add') return currentStock + quantity;
    if (type === 'remove') return Math.max(0, currentStock - quantity);
    if (type === 'set') return quantity;
    return currentStock;
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ombordagi miqdorni o'zgartirish</DialogTitle>
          <DialogDescription>
            {product.name} - Joriy ombordagi miqdor: {currentStock} dona
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="adjustmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>O'zgartirish turi</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="add" id="add" />
                        <Label htmlFor="add" className="flex items-center gap-2 cursor-pointer">
                          <Plus className="h-4 w-4 text-green-600" />
                          Qo'shish
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="remove" id="remove" />
                        <Label htmlFor="remove" className="flex items-center gap-2 cursor-pointer">
                          <Minus className="h-4 w-4 text-red-600" />
                          Ayirish
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="set" id="set" />
                        <Label htmlFor="set" className="cursor-pointer">
                          O'rnatish
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {adjustmentType === 'set' ? 'Yangi miqdor' : 'Miqdor'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    {adjustmentType === 'add' && `Yangi ombordagi miqdor: ${previewStock} dona`}
                    {adjustmentType === 'remove' && `Yangi ombordagi miqdor: ${previewStock} dona`}
                    {adjustmentType === 'set' && `Ombordagi miqdor ${previewStock} donaga o'rnatiladi`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Sabab</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sababni tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {adjustmentReasons[adjustmentType]?.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel optional>Qo'shimcha izoh</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Qo'shimcha ma'lumot..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Joriy ombordagi miqdor:</span>
                <span className="font-semibold">{currentStock} dona</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Yangi ombordagi miqdor:</span>
                <span
                  className={`font-semibold ${
                    previewStock < currentStock ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {previewStock} dona
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default StockAdjustment;

