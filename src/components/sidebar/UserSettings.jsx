import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { logout } from '@/middleware/authMiddleware';
import { useTheme } from '@/provider/ThemeProvider';
import { LogOut, Monitor, Moon, Settings, Sun, SunMoon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export function UserSettings() {
  const [openAlert, setOpenAlert] = useState(false);
  const { setTheme } = useTheme();
  const location = useLocation();
  const { state } = useSidebar();
  const { t } = useTranslation();
  const [storeData, setStoreData] = useState(null);

  // Load store data from localStorage
  useEffect(() => {
    try {
      const storeDataStr = localStorage.getItem('storeData');
      if (storeDataStr) {
        const data = JSON.parse(storeDataStr);
        setStoreData(data);
      }
    } catch (error) {
      console.error('Error loading store data:', error);
    }

    // Listen for localStorage changes
    const handleStorageChange = () => {
      try {
        const storeDataStr = localStorage.getItem('storeData');
        if (storeDataStr) {
          const data = JSON.parse(storeDataStr);
          setStoreData(data);
        }
      } catch (error) {
        console.error('Error loading store data:', error);
      }
    };

    window.addEventListener('localStorageChange', handleStorageChange);
    return () => {
      window.removeEventListener('localStorageChange', handleStorageChange);
    };
  }, []);

  // Helper function to format image URL
  const formatImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3008/v1';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    let url = imageUrl;
    if (url.startsWith('uploads/')) {
      url = url.replace('uploads/', '');
    }
    return `${cleanBaseUrl}/uploads/${url}`;
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        setTheme('dark');
      }
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        setTheme('light');
      }
      if (event.ctrlKey && event.key === 'g') {
        event.preventDefault();
        setTheme('system');
      }
      if (event.ctrlKey && event.key === 'q') {
        event.preventDefault();
        setOpenAlert(true);
      }
      if (event.ctrlKey && event.key === 'N') {
        event.preventDefault();
        console.log('New branch');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setTheme]);

  return (
    <div className="w-full grow flex items-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={
              state === 'collapsed'
                ? storeData?.name || t('Sozlamalar')
                : undefined
            }
            className="w-full h-10 mt-5 justify-start hover:bg-muted group-data-[collapsible=icon]:justify-center border-2 border-border"
          >
            {storeData?.logo?.url ? (
              <img
                src={formatImageUrl(storeData.logo.url)}
                alt={storeData.name || 'Store'}
                className="w-6 h-6 group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6 object-cover rounded-full"
              />
            ) : (
              <Settings className="w-4 h-4 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
            )}
            <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
              {storeData?.name || t('Sozlamalar')}
            </span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <SunMoon className="mr-2 h-4 w-4" />
                <span>{t('theme')}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-40">
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>{t('lightTheme')}</span>
                    <DropdownMenuShortcut>⌘F</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>{t('darkTheme')}</span>
                    <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>{t('systemTheme')}</span>
                    <DropdownMenuShortcut>⌘G</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('logout')}</span>
            <DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
