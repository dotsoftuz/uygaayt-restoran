import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

function Password() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    // Firebase removed - get email from backend API or localStorage
    const storeData = localStorage.getItem('storeData');
    if (storeData) {
      try {
        const store = JSON.parse(storeData);
        if (store.email) {
          setEmail(store.email);
        }
      } catch (e) {
        console.error('Error parsing store data:', e);
      }
    }
  }, []);

  const onSubmit = async (data) => {
    setError('Password update functionality is not available. Please use the backend API for password updates.');
    // Firebase removed - use backend API instead
    toast.error('Password update functionality is not available. Please use the backend API for password updates.');
  };

  const newPassword = watch('newPassword');

  const handleCancel = () => {
    reset();
  };

  return (
    <div>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label required htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            disabled
            defaultValue={email}
            placeholder={email}
            {...register('email')}
          />
        </div>

        <div>
          <Label required htmlFor="currentPassword">
            {t('currentPassword')}
          </Label>
          <Input
            id="currentPassword"
            type="password"
            placeholder="********"
            {...register('currentPassword', {
              required: 'Current password is required',
            })}
          />
          {errors.currentPassword && (
            <p className="text-red-500 text-sm">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="newPassword">{t('newPassword')}</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="********"
            {...register('newPassword')}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            disabled={isSubmitting}
            variant="secondary"
            onClick={handleCancel}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting || !newPassword}>
            {isSubmitting ? `${t('updating')}` : `${t('update')}`}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Password;
