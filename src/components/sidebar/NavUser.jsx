import {
  ChevronsUpDown,
  LogOut,
  Settings,
  Sun,
  Moon,
  Monitor,
  SunMoon,
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
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/provider/ThemeProvider';

export function NavUser() {
  const { isMobile, state } = useSidebar();
  const { userData, user } = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
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
                  ? userData?.displayName || 'User'
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
                  <span className="hidden truncate font-semibold">
                    {' '}
                    {userData?.displayName
                      ? userData?.displayName
                      : 'Anonymous'}
                  </span>
                  <span className="truncate text-xs">
                    {' '}
                    {user?.isAnonymous ? 'anonymous@gmail.com' : user?.email}
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
