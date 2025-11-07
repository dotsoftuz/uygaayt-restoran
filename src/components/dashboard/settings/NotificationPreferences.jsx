import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Bell, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function NotificationPreferences() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferences, setPreferences] = useState({
    email: {
      enabled: true,
      orderUpdates: true,
      promotions: true,
      systemAlerts: true,
    },
    push: {
      enabled: true,
      orderUpdates: true,
      promotions: false,
      systemAlerts: true,
    },
    sms: {
      enabled: false,
      orderUpdates: false,
      promotions: false,
      systemAlerts: true,
    },
  });

  const handleChannelToggle = (channel) => {
    setPreferences((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        enabled: !prev[channel].enabled,
      },
    }));
  };

  const handlePreferenceToggle = (channel, preference) => {
    setPreferences((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [preference]: !prev[channel][preference],
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Notification preferences saved:', preferences);
      toast.success('Xabarnoma sozlamalari saqlandi');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast.error('Ma\'lumotlarni saqlashda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const channels = [
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'push', label: 'Push xabarnomalar', icon: Bell },
    { key: 'sms', label: 'SMS', icon: MessageSquare },
  ];

  const preferenceLabels = {
    orderUpdates: 'Buyurtma yangilanishlari',
    promotions: 'Aksiyalar va promo kodlar',
    systemAlerts: 'Tizim ogohlantirishlari',
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        {channels.map((channel) => {
          const Icon = channel.icon;
          const channelData = preferences[channel.key];

          return (
            <Card key={channel.key}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <CardTitle className="text-sm sm:text-base">{channel.label}</CardTitle>
                  </div>
                  <Switch
                    checked={channelData.enabled}
                    onCheckedChange={() => handleChannelToggle(channel.key)}
                  />
                </div>
              </CardHeader>
              {channelData.enabled && (
                <CardContent className="space-y-3 pt-0">
                  {Object.entries(preferenceLabels).map(([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <Label className="text-xs sm:text-sm font-normal cursor-pointer">
                        {label}
                      </Label>
                      <Switch
                        checked={channelData[key]}
                        onCheckedChange={() =>
                          handlePreferenceToggle(channel.key, key)
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setPreferences({
              email: {
                enabled: true,
                orderUpdates: true,
                promotions: true,
                systemAlerts: true,
              },
              push: {
                enabled: true,
                orderUpdates: true,
                promotions: false,
                systemAlerts: true,
              },
              sms: {
                enabled: false,
                orderUpdates: false,
                promotions: false,
                systemAlerts: true,
              },
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

export default NotificationPreferences;

