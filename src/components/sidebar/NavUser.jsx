import React, { useState, useEffect } from 'react';
import {
  ChevronsUpDown,
  LogOut,
  Settings,
  Sun,
  Moon,
  Monitor,
  SunMoon,
  Languages,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAppContext } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/provider/ThemeProvider';
import { logout } from '@/middleware/authMiddleware';
import api from '@/services/api';

export function NavUser() {
  const { isMobile, state } = useSidebar();
  const { userData, user } = useAppContext();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [storeData, setStoreData] = useState(null);

  // API orqali store ma'lumotlarini olish
  useEffect(() => {
    const fetchStoreData = async () => {
      // Token mavjudligini tekshirish
      const token = localStorage.getItem('token');
      if (!token) {
        // Token yo'q bo'lsa, localStorage'dan olish
        try {
          const storeDataStr = localStorage.getItem('storeData');
          if (storeDataStr) {
            setStoreData(JSON.parse(storeDataStr));
          }
        } catch (parseError) {
          console.error('Error parsing cached store data:', parseError);
        }
        return;
      }

      // Kichik kechikish - login qilgandan keyin token to'g'ri ishlashini kutish
      await new Promise(resolve => setTimeout(resolve, 200));

      try {
        const response = await api.get('/store/get');
        const data = response?.data || response;
        
        if (data) {
          setStoreData(data);
          // localStorage'ga ham saqlash (cache uchun)
          localStorage.setItem('storeData', JSON.stringify(data));
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
        
        // Agar API xato bersa, localStorage'dan olish
        try {
          const storeDataStr = localStorage.getItem('storeData');
          if (storeDataStr) {
            setStoreData(JSON.parse(storeDataStr));
          }
        } catch (parseError) {
          console.error('Error parsing cached store data:', parseError);
        }
      }
    };

    fetchStoreData();
  }, []);

  const handleSignOut = async () => {
    logout();
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={
                state === 'collapsed'
                  ? storeData?.name || userData?.displayName || 'Do\'kon'
                  : undefined
              }
              className={`data-[state=open]:text-sidebar-accent-foreground 
     transition-all duration-200 rounded-full overflow-hidden 
    group-data-[collapsible=icon]:!size-12 group-data-[collapsible=icon]:!mx-auto 
    ${state === 'collapsed' ? 'justify-center' : ''}`}
            >
              <Avatar className={`rounded-full h-8 w-8 lg:h-8 lg:w-8 object-cover`}>
                <AvatarImage
                  src="/assets/logos/uygaayt-shape.svg"
                  alt={userData?.displayName || 'Anonymous'}
                />
                <AvatarFallback className="rounded-full text-xs font-medium">
                  CN
                </AvatarFallback>
              </Avatar>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src="/assets/logos/uygaayt-shape.svg"
                    alt={
                      userData?.displayName
                        ? userData?.displayName
                        : 'Anonymous'
                    }
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {storeData?.name || userData?.displayName || 'Do\'kon'}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {storeData?.email || user?.email || 'email@example.com'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link to="/dashboard/settings">
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                {t('settings')}
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <SunMoon className="mr-2 h-4 w-4" />
                  <span>Mavzu</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-40">
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Kunduzgi</span>
                      <DropdownMenuShortcut>⌘F</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Tungi</span>
                      <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')}>
                      <Monitor className="mr-2 h-4 w-4" />
                      <span>Sistema</span>
                      <DropdownMenuShortcut>⌘G</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Languages className="mr-2 h-4 w-4" />
                  <span>{t('language')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-40">
                    <DropdownMenuItem onClick={() => changeLanguage('uz')}>
                      <span>O'zbek</span>
                      {i18n.language === 'uz' && (
                        <DropdownMenuShortcut>✓</DropdownMenuShortcut>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeLanguage('ru')}>
                      <span>Russkie</span>
                      {i18n.language === 'ru' && (
                        <DropdownMenuShortcut>✓</DropdownMenuShortcut>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeLanguage('en')}>
                      <span>English</span>
                      {i18n.language === 'en' && (
                        <DropdownMenuShortcut>✓</DropdownMenuShortcut>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              {t('logout')}
              <DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
