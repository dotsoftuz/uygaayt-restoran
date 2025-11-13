import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/provider/ThemeProvider';
import { cn } from '@/lib/utils';
import { Settings, Sun, Moon, Monitor, SunMoon, LogOut } from 'lucide-react';
import { logout } from '@/middleware/authMiddleware';
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

export function UserSettings() {
  const [openAlert, setOpenAlert] = useState(false);
  const { setTheme } = useTheme();
  const location = useLocation();
  const { state } = useSidebar();

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
            tooltip={state === 'collapsed' ? 'Sozlamalar' : undefined}
            className="w-full h-10 mt-5 justify-start hover:bg-muted group-data-[collapsible=icon]:justify-center border-2 border-border"
          >
            <Settings className="w-4 h-4 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
            <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
              Sozlamalar
            </span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
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
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Chiqish</span>
            <DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
