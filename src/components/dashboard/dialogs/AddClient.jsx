import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { useAppContext } from '@/context/AppContext';

export default function AddClient({ open, onOpenChange, onSubmit }) {
  const { addClient, userUid } = useAppContext();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      phone: '+998',
      email: '',
      address: '',
      notes: '',
    },
  });

  const onFormSubmit = async (data) => {
    try {
      const clientData = {
        ...data,
        clientLinks: [],
      };
      await addClient(clientData, userUid);
      reset();
      onOpenChange(false);
      if (onSubmit) {
        onSubmit(clientData);
      }
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yangi mijoz qo'shish</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ism</Label>
            <Input
              disabled={isSubmitting}
              id="name"
              {...register('name', {
                required: 'Ism majburiy',
              })}
              placeholder="Mijoz ismini kiriting"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              disabled={isSubmitting}
              id="phone"
              type="tel"
              {...register('phone', {
                required: 'Telefon raqami majburiy',
                pattern: {
                  value: /^\+998[0-9]{9}$/,
                  message: "Telefon raqami noto'g'ri formatda",
                },
              })}
              placeholder="+998 90 123 45 67"
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Manzil (ixtiyoriy)</Label>
            <Input
              disabled={isSubmitting}
              id="address"
              {...register('address')}
              placeholder="Manzilni kiriting"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Qo'shimcha ma'lumotlar (ixtiyoriy)</Label>
            <Input
              disabled={isSubmitting}
              id="notes"
              {...register('notes')}
              placeholder="Qo'shimcha ma'lumotlar"
            />
          </div>

          <DialogFooter>
            <Button
              disabled={isSubmitting}
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Bekor qilish
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
