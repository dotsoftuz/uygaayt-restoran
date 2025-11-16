import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  KeyRound,
  WandSparkles,
  Store,
  ShoppingCart,
  Bell,
  Settings,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import Appearance from './Appearance';
import Password from './Password';
import ProfileHeader from './ProfileHeader';
import StoreSettings from './StoreSettings';
import OrderSettings from './OrderSettings';
import NotificationPreferences from './NotificationPreferences';
import SystemSettings from './SystemSettings';

const SETTINGS_TABS = [
  {
    value: 'store',
    label: 'Do\'kon sozlamalari',
    icon: Store,
    description: 'Do\'kon ma\'lumotlari va ish vaqti',
  },
  {
    value: 'order',
    label: 'Buyurtma sozlamalari',
    icon: ShoppingCart,
    description: 'Yetkazib berish va to\'lov usullari',
  },
  {
    value: 'notifications',
    label: 'Xabarnomalar',
    icon: Bell,
    description: 'Email, push va SMS xabarnomalar',
  },
  {
    value: 'system',
    label: 'Tizim sozlamalari',
    icon: Settings,
    description: 'Jamoa va API kalitlar',
  },
  {
    value: 'appearance',
    label: 'Ko\'rinish',
    icon: WandSparkles,
    description: 'Tema va dizayn sozlamalari',
    badge: 'new',
  },
  {
    value: 'password',
    label: 'Parol',
    icon: KeyRound,
    description: 'Parolni o\'zgartirish',
  },
];

function SettingsPage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'store';

  const [imageSrc, setImageSrc] = useState();
  const [imageSelected, setImageSelected] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);

  return (
    <div className="space-y-4 py-2 sm:py-4">
      {/* Profile Header */}
      <ProfileHeader
        imageSrc={imageSrc}
        setImageSrc={setImageSrc}
        imageSelected={imageSelected}
        setImageSelected={setImageSelected}
        setIsFormChanged={setIsFormChanged}
      />

      {/* Settings Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => {
          setSearchParams({ tab: value }, { replace: true });
        }}
        className="w-full"
      >
        {/* Mobile: Horizontal Scrollable Tabs */}
        <div className="lg:hidden">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <TabsList className="h-auto w-full justify-start rounded-none border-b border-border bg-transparent p-0">
                  <div className="flex gap-1 sm:gap-1.5 px-1 py-2.5 sm:py-3 min-w-max">
                    {SETTINGS_TABS.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md border-b-2 border-transparent bg-transparent text-muted-foreground transition-all hover:text-foreground hover:bg-accent/50 data-[state=active]:border-primary data-[state=active]:bg-accent/30 data-[state=active]:text-foreground data-[state=active]:shadow-none whitespace-nowrap flex-shrink-0"
                        >
                          <Icon
                            className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0"
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                          <span className="whitespace-nowrap hidden sm:inline">
                            {tab.value === 'appearance' ? t('appearance') : tab.label}
                          </span>
                          <span className="whitespace-nowrap sm:hidden">
                            {tab.value === 'appearance' ? t('appearance') : tab.label.split(' ')[0]}
                          </span>
                          {tab.badge && (
                            <Badge className="ml-1 h-4 px-1.5 text-[10px] flex-shrink-0">
                              {t('new')}
                            </Badge>
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </div>
                </TabsList>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desktop: Vertical Tabs + Content Grid */}
        <div className="hidden lg:grid lg:grid-cols-[240px_1fr] lg:gap-4">
          {/* Sidebar Tabs */}
          <Card className="h-fit rounded-l-none sticky top-4 overflow-hidden">
            <CardContent className="p-0">
              <TabsList className="flex flex-col h-auto w-full justify-start rounded-none border-r border-0 border-border bg-transparent p-0">
                <div className="flex flex-col w-full">
                  {SETTINGS_TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="relative flex items-center gap-2 w-full justify-start px-4 py-3 text-sm font-medium rounded-none border-l-2 border-transparent bg-transparent text-muted-foreground transition-all hover:text-foreground hover:bg-accent/50 data-[state=active]:border-primary data-[state=active]:bg-accent/30 data-[state=active]:text-foreground data-[state=active]:shadow-none"
                      >
                        <Icon
                          className="h-4 w-4 flex-shrink-0"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        <span className="whitespace-nowrap">
                          {tab.value === 'appearance' ? t('appearance') : tab.label}
                        </span>
                        {tab.badge && (
                          <Badge className="ml-auto h-4 px-1.5 text-xs">
                            {t('new')}
                          </Badge>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </div>
              </TabsList>
            </CardContent>
          </Card>

          {/* Content Area */}
          <div className="min-w-0 border border-border rounded-lg p-4">
            <TabsContent value="store" className="mt-0">
              <div className="max-w-2xl">
                <StoreSettings />
              </div>
            </TabsContent>

            <TabsContent value="order" className="mt-0">
              <div className="max-w-2xl">
                <OrderSettings />
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <div className="max-w-2xl">
                <NotificationPreferences />
              </div>
            </TabsContent>

            <TabsContent value="system" className="mt-0">
              <div className="max-w-4xl">
                <SystemSettings />
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="mt-0">
              <div className="max-w-2xl">
                <Appearance />
              </div>
            </TabsContent>

            <TabsContent value="password" className="mt-0">
              <div className="max-w-2xl">
                <Password />
              </div>
            </TabsContent>
          </div>
        </div>

        {/* Mobile: Tab Contents */}
        <div className="lg:hidden mt-4">
          <TabsContent value="store" className="mt-0">
            <div className="w-full">
              <StoreSettings />
            </div>
          </TabsContent>

          <TabsContent value="order" className="mt-0">
            <div className="w-full">
              <OrderSettings />
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <div className="w-full">
              <NotificationPreferences />
            </div>
          </TabsContent>

          <TabsContent value="system" className="mt-0">
            <div className="w-full">
              <SystemSettings />
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <div className="w-full">
              <Appearance />
            </div>
          </TabsContent>

          <TabsContent value="password" className="mt-0">
            <div className="w-full">
              <Password />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default SettingsPage;
