import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import api from '@/services/api';

function Password() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    // Get phone number from localStorage
    const storeData = localStorage.getItem('storeData');
    if (storeData) {
      try {
        const store = JSON.parse(storeData);
        if (store.phoneNumber) {
          setPhoneNumber(store.phoneNumber);
        }
      } catch (e) {
        console.error('Error parsing store data:', e);
      }
    }
  }, []);

  const onSubmit = async (data) => {
    setError('');
    
    // Validate current password is provided
    if (!data.currentPassword || data.currentPassword.trim() === '') {
      toast.error('Joriy parolni kiriting');
      return;
    }

    // Validate new password is provided
    if (!data.newPassword || data.newPassword.trim() === '') {
      toast.error('Yangi parolni kiriting');
      return;
    }

    // Validate password length
    if (data.newPassword.length < 4) {
      toast.error('Yangi parol kamida 4 ta belgi bo\'lishi kerak');
      return;
    }

    // Validate passwords match
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Yangi parol va tasdiqlash paroli mos kelmaydi');
      return;
    }

    // Validate new password is different from current password
    if (data.currentPassword === data.newPassword) {
      toast.error('Yangi parol joriy paroldan farq qilishi kerak');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.put('/store/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response) {
        toast.success('Parol muvaffaqiyatli yangilandi');
        reset();
        setError('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      
      // Handle different error cases
      const errorMessage = error?.response?.data?.message || error?.message || '';
      const statusCode = error?.response?.status || error?.statusCode;
      
      if (statusCode === 401 || statusCode === 403 || errorMessage.toLowerCase().includes('wrong') || errorMessage.toLowerCase().includes('noto\'g\'ri') || errorMessage.toLowerCase().includes('xato')) {
        toast.error('Joriy parol noto\'g\'ri');
        setError('Joriy parol noto\'g\'ri');
      } else if (statusCode === 404) {
        toast.error('Parol topilmadi. Iltimos, qayta urinib ko\'ring');
        setError('Parol topilmadi');
      } else if (statusCode === 400) {
        toast.error(errorMessage || 'Noto\'g\'ri ma\'lumot kiritildi');
        setError(errorMessage || 'Noto\'g\'ri ma\'lumot');
      } else {
        toast.error(errorMessage || 'Parolni yangilashda xatolik yuz berdi');
        setError(errorMessage || 'Parolni yangilashda xatolik yuz berdi');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  const handleCancel = () => {
    reset();
    setError('');
  };

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label required htmlFor="phoneNumber">
            Telefon raqami
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            disabled
            value={phoneNumber}
            placeholder="+998901234567"
            {...register('phoneNumber')}
          />
        </div>

        <div>
          <Label required htmlFor="currentPassword">
            Joriy parol
          </Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Joriy parolni kiriting"
              className="pr-10"
              {...register('currentPassword', {
                required: 'Joriy parol majburiy',
              })}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div>
          <Label required htmlFor="newPassword">Yangi parol</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Yangi parolni kiriting"
              className="pr-10"
              {...register('newPassword', {
                required: 'Yangi parol majburiy',
                minLength: {
                  value: 4,
                  message: 'Parol kamida 4 ta belgi bo\'lishi kerak',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <Label required htmlFor="confirmPassword">Yangi parolni tasdiqlash</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Yangi parolni qayta kiriting"
              className="pr-10"
              {...register('confirmPassword', {
                required: 'Parolni tasdiqlash majburiy',
                validate: (value) => {
                  if (value !== newPassword) {
                    return 'Parollar mos kelmaydi';
                  }
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            disabled={isSubmitting}
            variant="secondary"
            onClick={handleCancel}
          >
            Bekor qilish
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          >
            {isSubmitting ? 'Yangilanmoqda...' : 'Yangilash'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Password;
