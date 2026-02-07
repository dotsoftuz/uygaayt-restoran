import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import api from '@/services/api';
import { Loader2, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

function DeliverySettings() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(10000);
  const [deliveryRadius, setDeliveryRadius] = useState(5000);
  const [selfPickupEnabled, setSelfPickupEnabled] = useState(true);
  const [storeData, setStoreData] = useState(null);

  // Ma'lumotlarni HAR SAFAR yuklash
  useEffect(() => {
    const fetchDeliverySettings = async () => {
      console.log(' [DeliverySettings] fetchDeliverySettings started');
      try {
        // Avval localStorage'dan ma'lumotni olish (tezroq ko'rsatish uchun)
        const storeDataStr = localStorage.getItem('storeData');
        console.log(
          ' [DeliverySettings] localStorage data:',
          storeDataStr ? JSON.parse(storeDataStr) : null
        );

        if (storeDataStr) {
          const data = JSON.parse(storeDataStr);
          setStoreData(data);

          // Agar ma'lumot mavjud bo'lsa, formani to'ldirish
          if (data && Object.keys(data).length > 0) {
            console.log(' [DeliverySettings] Setting form from localStorage:', {
              deliveryFee: data.deliveryFee || data.deliveryPrice,
              deliveryRadius: data.deliveryRadius,
              selfPickupEnabled: data.selfPickupEnabled,
            });
            setDeliveryFee(data.deliveryFee || data.deliveryPrice || 10000);
            setDeliveryRadius(data.deliveryRadius || 5000);
            setSelfPickupEnabled(data.selfPickupEnabled !== false);
          }
        }

        // HAR SAFAR API'dan yangi ma'lumot olish
        const token = localStorage.getItem('token');
        console.log(' [DeliverySettings] Token exists:', !!token);

        if (token) {
          console.log(' [DeliverySettings] Fetching from API...');
          const response = await api.get('/store/get');
          const data = response?.data || response;
          console.log(' [DeliverySettings] API response:', data);

          if (data) {
            setStoreData(data);
            console.log(' [DeliverySettings] Setting form from API:', {
              deliveryFee: data.deliveryFee || data.deliveryPrice,
              deliveryRadius: data.deliveryRadius,
              selfPickupEnabled: data.selfPickupEnabled,
            });
            setDeliveryFee(data.deliveryFee || data.deliveryPrice || 10000);
            setDeliveryRadius(data.deliveryRadius || 5000);
            setSelfPickupEnabled(data.selfPickupEnabled !== false);

            // LocalStorage'ni yangilash
            const existingData = JSON.parse(storeDataStr || '{}');
            const updatedData = { ...existingData, ...data };
            localStorage.setItem('storeData', JSON.stringify(updatedData));
            console.log(
              ' [DeliverySettings] Updated localStorage with new data'
            );
          }
        }
      } catch (error) {
        console.error(
          ' [DeliverySettings] Error fetching delivery settings:',
          error
        );
      }
    };

    fetchDeliverySettings();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      // Bu komponent o'z-o'zidan yangilaydi (handleSubmit da),
      // shuning uchun bu yerda faqat boshqa komponentlardan kelgan
      // o'zgarishlarni kuzatish uchun ishlatiladi
      // Lekin biz o'z-o'zidan yangilayotganimiz uchun, bu yerda
      // localStorage'dan o'qish kerak emas, chunki state allaqachon yangilangan
      console.log(
        ' [DeliverySettings] localStorageChange event received (ignored - self-updated)'
      );
    };

    window.addEventListener('localStorageChange', handleStorageChange);

    return () => {
      window.removeEventListener('localStorageChange', handleStorageChange);
    };
  }, []);

  const handleSubmit = async () => {
    console.log(' [DeliverySettings] handleSubmit started');
    console.log(' [DeliverySettings] Form values before save:', {
      deliveryFee,
      deliveryRadius,
      selfPickupEnabled,
    });

    setIsSubmitting(true);
    try {
      // Backend'ga yuborish uchun ma'lumotlar
      const updateData = {
        _id: storeData?._id,
        name: storeData?.name || '',
        phoneNumber: storeData?.phoneNumber || '',
        workTime: storeData?.workTime || '08:00-20:00', // Majburiy maydon
        deliveryPrice: deliveryFee, // Backend deliveryPrice deb kutadi
        deliveryRadius,
        selfPickupEnabled,
      };

      console.log(' [DeliverySettings] Sending to API:', updateData);
      const response = await api.put('/store/update', updateData);
      const serverData = response?.data || response;
      const updatedStoreData = serverData
        ? { ...serverData, ...updateData }
        : updateData;
      console.log(
        ' [DeliverySettings] API response after save:',
        updatedStoreData
      );

      // AVVAL state'larni yangilash (localStorage'dan o'qishdan oldin)
      const finalDeliveryFee =
        updatedStoreData.deliveryFee ||
        updatedStoreData.deliveryPrice ||
        deliveryFee;
      const finalDeliveryRadius =
        updatedStoreData.deliveryRadius || deliveryRadius;
      const finalSelfPickupEnabled =
        updatedStoreData.selfPickupEnabled !== undefined
          ? updatedStoreData.selfPickupEnabled
          : selfPickupEnabled;

      setDeliveryFee(finalDeliveryFee);
      setDeliveryRadius(finalDeliveryRadius);
      setSelfPickupEnabled(finalSelfPickupEnabled);

      // LocalStorage'ni yangilash
      const currentStoreData = JSON.parse(
        localStorage.getItem('storeData') || '{}'
      );
      const finalData = {
        ...currentStoreData,
        ...updatedStoreData,
        deliveryFee: finalDeliveryFee,
        deliveryPrice: finalDeliveryFee,
        deliveryRadius: finalDeliveryRadius,
        selfPickupEnabled: finalSelfPickupEnabled,
      };
      localStorage.setItem('storeData', JSON.stringify(finalData));
      console.log(
        ' [DeliverySettings] Updated localStorage after save:',
        finalData
      );

      // Store data ni yangilash
      setStoreData(finalData);

      // Keyin event trigger qilish (boshqa komponentlar uchun)
      window.dispatchEvent(new Event('localStorageChange'));
      console.log(' [DeliverySettings] Dispatched localStorageChange event');

      console.log(' [DeliverySettings] Save completed successfully');
      toast.success(t('deliverySettingsSaved'));
    } catch (error) {
      console.error(
        ' [DeliverySettings] Error saving delivery settings:',
        error
      );
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Ma'lumotlarni saqlashda xatolik yuz berdi";
      toast.error(errorMessage);
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
            {t('deliveryFee')}
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
            <span className="text-xs sm:text-sm text-muted-foreground">
              so'm
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('deliveryFeeDescription')}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">{t('deliveryRadius')}</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              step="100"
              value={deliveryRadius}
              onChange={(e) => setDeliveryRadius(parseInt(e.target.value) || 0)}
              className="w-full sm:w-[200px] text-sm sm:text-base"
            />
            <span className="text-xs sm:text-sm text-muted-foreground">
              metr
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('deliveryRadiusDescription')}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-xs sm:text-sm">{t('selfPickup')}</Label>
            <p className="text-xs text-muted-foreground">
              {t('selfPickupDescription')}
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
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="text-xs sm:text-sm"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Saqlash
        </Button>
      </div>
    </div>
  );
}

export default DeliverySettings;
