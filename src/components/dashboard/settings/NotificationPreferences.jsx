import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useNotificationContext } from '@/context/NotificationContext';
import {
  AlertTriangle,
  Bell,
  Monitor,
  Play,
  Settings2,
  ShoppingCart,
  Volume2,
} from 'lucide-react';
import { toast } from 'sonner';

function NotificationPreferences() {
  const { settings, updateSettings, playSound, requestPermission } =
    useNotificationContext();

  const handleToggle = (key) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleTypeToggle = (typeKey) => {
    updateSettings({
      types: {
        ...settings.types,
        [typeKey]: !settings.types[typeKey],
      },
    });
  };

  const handleVolumeChange = (e) => {
    updateSettings({ soundVolume: parseFloat(e.target.value) });
  };

  const handleTestSound = () => {
    playSound();
    toast.success('Test tovushi chalindi');
  };

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      toast.success('Desktop bildirishnomalarga ruxsat berildi');
    } else if (result === 'denied') {
      toast.error(
        'Desktop bildirishnomalar rad etildi. Brauzer sozlamalaridan ruxsat bering.'
      );
    }
  };

  const notificationTypes = [
    {
      key: 'orders',
      label: 'Buyurtma bildirishnomalari',
      icon: ShoppingCart,
      description: 'Yangi buyurtmalar haqida xabar olish',
    },
    {
      key: 'complaints',
      label: 'Shikoyat bildirishnomalari',
      icon: AlertTriangle,
      description: 'Mijoz shikoyatlari haqida xabar olish',
    },
    {
      key: 'system',
      label: 'Tizim bildirishnomalari',
      icon: Settings2,
      description: 'Tizim yangilanishlari va ogohlantirishlar',
    },
    {
      key: 'reminders',
      label: 'Eslatmalar',
      icon: Bell,
      description: 'Yetkazib berish va boshqa eslatmalar',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tovush sozlamalari */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <CardTitle className="text-sm sm:text-base">Tovush</CardTitle>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={() => handleToggle('soundEnabled')}
            />
          </div>
        </CardHeader>
        {settings.soundEnabled && (
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm font-normal">
                  Tovush balandligi
                </Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round((settings.soundVolume || 0.6) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.soundVolume || 0.6}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestSound}
              className="text-xs sm:text-sm"
            >
              <Play className="w-3 h-3 mr-1.5" />
              Test tovush
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Desktop bildirishnomalar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
              <CardTitle className="text-sm sm:text-base">
                Desktop bildirishnomalar
              </CardTitle>
            </div>
            <Switch
              checked={settings.desktopEnabled}
              onCheckedChange={() => handleToggle('desktopEnabled')}
            />
          </div>
        </CardHeader>
        {settings.desktopEnabled && (
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-3">
              Brauzer tab faol bo'lmaganda desktop bildirishnomalar ko'rsatiladi
            </p>
            {'Notification' in window &&
              Notification.permission !== 'granted' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestPermission}
                  className="text-xs sm:text-sm"
                >
                  Ruxsat so'rash
                </Button>
              )}
            {'Notification' in window &&
              Notification.permission === 'granted' && (
                <p className="text-xs text-green-600">✓ Ruxsat berilgan</p>
              )}
          </CardContent>
        )}
      </Card>

      {/* Toast bildirishnomalar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <CardTitle className="text-sm sm:text-base">
                Toast bildirishnomalar
              </CardTitle>
            </div>
            <Switch
              checked={settings.toastEnabled}
              onCheckedChange={() => handleToggle('toastEnabled')}
            />
          </div>
        </CardHeader>
        {settings.toastEnabled && (
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              Ilovada pastki qismda qisqa bildirishnoma ko'rsatiladi
            </p>
          </CardContent>
        )}
      </Card>

      {/* Bildirishnoma turlari */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <CardTitle className="text-sm sm:text-base">
              Bildirishnoma turlari
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {notificationTypes.map(({ key, label, icon: Icon, description }) => (
            <div
              key={key}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label className="text-xs sm:text-sm font-normal cursor-pointer">
                    {label}
                  </Label>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.types?.[key] ?? true}
                onCheckedChange={() => handleTypeToggle(key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default NotificationPreferences;
