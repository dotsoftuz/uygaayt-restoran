import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  KeyRound,
  WandSparkles,
  Store,
  ShoppingCart,
  Bell,
  Settings,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Appearance from './Appearance';
import Password from './Password';
import ProfileHeader from './ProfileHeader';
import StoreSettings from './StoreSettings';
import OrderSettings from './OrderSettings';
import NotificationPreferences from './NotificationPreferences';
import SystemSettings from './SystemSettings';

function SettingsPage() {
  const { t } = useTranslation();

  const [imageSrc, setImageSrc] = useState();
  const [imageSelected, setImageSelected] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);

  return (
    <div className="my-4">
      <ProfileHeader
        imageSrc={imageSrc}
        setImageSrc={setImageSrc}
        imageSelected={imageSelected}
        setImageSelected={setImageSelected}
        setIsFormChanged={setIsFormChanged}
      />
      <Tabs defaultValue="store" className="mt-4">
        <ScrollArea>
          <TabsList className="mb-3 h-auto gap-2 rounded-none border-b border-border bg-transparent px-0 py-1 text-foreground">
            <TabsTrigger
              value="store"
              className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
            >
              <Store
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Do'kon sozlamalari
            </TabsTrigger>
            <TabsTrigger
              value="order"
              className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
            >
              <ShoppingCart
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Buyurtma sozlamalari
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
            >
              <Bell
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Xabarnomalar
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
            >
              <Settings
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Tizim sozlamalari
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
            >
              <WandSparkles
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              {t('appearance')}
              <Badge className="ms-1.5">{t('new')}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
            >
              <KeyRound
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              {t('password')}
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <TabsContent value="store" className="max-w-2xl">
          <StoreSettings />
        </TabsContent>
        <TabsContent value="order" className="max-w-2xl">
          <OrderSettings />
        </TabsContent>
        <TabsContent value="notifications" className="max-w-2xl">
          <NotificationPreferences />
        </TabsContent>
        <TabsContent value="system" className="max-w-4xl">
          <SystemSettings />
        </TabsContent>
        <TabsContent value="appearance" className="max-w-2xl">
          <Appearance />
        </TabsContent>
        <TabsContent value="password" className="max-w-2xl">
          <Password />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsPage;
