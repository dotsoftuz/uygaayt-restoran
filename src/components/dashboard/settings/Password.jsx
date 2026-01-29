import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

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
      toast.error(t('enterCurrentPassword'));
      return;
    }

    // Validate new password is provided
    if (!data.newPassword || data.newPassword.trim() === '') {
      toast.error(t('enterNewPassword'));
      return;
    }

    // Validate password length
    if (data.newPassword.length < 4) {
      toast.error(t('passwordMinLengthError'));
      return;
    }

    // Validate passwords match
    if (data.newPassword !== data.confirmPassword) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }

    // Validate new password is different from current password
    if (data.currentPassword === data.newPassword) {
      toast.error(t('newPasswordMustBeDifferent'));
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.put('/store/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response) {
        toast.success(t('passwordUpdatedSuccessfully'));
        reset();
        setError('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }
    } catch (error) {
      console.error('Error updating password:', error);

      // Handle different error cases
      const errorMessage =
        error?.response?.data?.message || error?.message || '';
      const statusCode = error?.response?.status || error?.statusCode;

      if (
        statusCode === 401 ||
        statusCode === 403 ||
        errorMessage.toLowerCase().includes('wrong') ||
        errorMessage.toLowerCase().includes("noto'g'ri") ||
        errorMessage.toLowerCase().includes('xato')
      ) {
        toast.error(t('currentPasswordIncorrect'));
        setError(t('currentPasswordIncorrect'));
      } else if (statusCode === 404) {
        toast.error(t('passwordNotFound'));
        setError(t('passwordNotFound'));
      } else if (statusCode === 400) {
        toast.error(errorMessage || t('invalidDataEntered'));
        setError(errorMessage || t('invalidData'));
      } else {
        toast.error(errorMessage || t('passwordUpdateError'));
        setError(errorMessage || t('passwordUpdateError'));
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
            {t('phoneNumber')}
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            disabled
            value={phoneNumber}
            placeholder={t('enterPhoneNumber')}
            {...register('phoneNumber')}
          />
        </div>

        <div>
          <Label required htmlFor="currentPassword">
            {t('currentPassword')}
          </Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder={t('enterCurrentPassword')}
              className="pr-10"
              {...register('currentPassword', {
                required: t('currentPasswordRequired'),
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
          <Label required htmlFor="newPassword">
            {t('newPassword')}
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              placeholder={t('enterNewPassword')}
              className="pr-10"
              {...register('newPassword', {
                required: t('newPasswordRequired'),
                minLength: {
                  value: 4,
                  message: t('passwordMinLengthError'),
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
          <Label required htmlFor="confirmPassword">
            {t('confirmNewPassword')}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('confirmNewPassword')}
              className="pr-10"
              {...register('confirmPassword', {
                required: t('confirmPasswordRequired'),
                validate: (value) => {
                  if (value !== newPassword) {
                    return t('passwordsDoNotMatch');
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
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword
            }
          >
            {isSubmitting ? t('updating') + '...' : t('update')}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Password;
