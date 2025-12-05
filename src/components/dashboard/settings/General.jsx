import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

function General({ photo, isFormChanged, setIsFormChanged, setImageSelected }) {
  const { userData, setUserData } = useAppContext();
  const { t } = useTranslation();

  const defaultValues = {
    displayName: userData?.displayName || '',
    location: userData?.location || '',
  };

  const {
    control,
    handleSubmit,
    register,
    setError,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm({ defaultValues });

  useEffect(() => {
    reset({
      displayName: userData?.displayName || '',
      location: userData?.location || '',
    });
  }, [userData, reset]);

  const onSubmit = async (data) => {
    try {
      // Firebase removed - use backend API instead
      const updatedData = {
        displayName: data.displayName,
        location: data.location,
        // photoURL: photoURL, // Handle photo upload via backend API
      };

      // TODO: Call backend API to update store settings
      console.warn('General settings update: Firebase removed, use backend API');

      setUserData((prevUserData) => ({
        ...prevUserData,
        ...updatedData,
      }));

      setImageSelected(null);
      toast('Profile updated successfully');
      setIsFormChanged(false);
    } catch (err) {
      console.error('Error updating profile:', err.message);
      setError('submit', {
        message: 'Failed to update profile. Please try again.',
      });
    }
  };

  const handleCancel = () => {
    reset(defaultValues);
    setIsFormChanged(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col items-start space-y-2">
        <Label required>{t('displayName')}</Label>
        <Input
          disabled={isSubmitting}
          {...register('displayName', { required: 'Display Name is required' })}
          placeholder={t('johnDoe')}
          onChange={() => setIsFormChanged(true)}
        />
        {errors.displayName && <p>{errors.displayName.message}</p>}
      </div>

      <div className="flex flex-col items-start space-y-2">
        <Label optional>{t('location')}</Label>
        <Input
          disabled={isSubmitting}
          {...register('location')}
          placeholder={t('sanFrancisco')}
          onChange={() => setIsFormChanged(true)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button disabled={isSubmitting || !isFormChanged} type="submit">
            {isSubmitting ? `${t('saving')}` : `${t('save')}`}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default General;
