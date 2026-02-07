import {
  ClipboardList,
  DollarSign,
  FolderTree,
  LayoutDashboard,
  Package,
  Settings,
  Star,
  Tag,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';

import { useAppContext } from '@/context/AppContext';
import { Link, useLocation } from 'react-router-dom';
// import { NavUser } from './NavUser';
import { useTranslation } from 'react-i18next';
import { UserSettings } from './UserSettings';

export function AppSidebar({ ...props }) {
  const { user } = useAppContext();
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    {
      title: t('Dashboard'),
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('Buyurtmalar'),
      url: '/dashboard/orders',
      icon: ClipboardList,
    },
    {
      title: t('Katalog'),
      url: '/dashboard/catalog',
      icon: FolderTree,
    },
    {
      title: t('Mahsulotlar'),
      url: '/dashboard/products',
      icon: Package,
    },
    {
      title: t('Moliya'),
      url: '/dashboard/finance',
      icon: DollarSign,
    },
    {
      title: t('Aksiyalar'),
      url: '/dashboard/promotions',
      icon: Tag,
    },
    {
      title: t('Sharhlar'),
      url: '/dashboard/reviews',
      icon: Star,
    },
    {
      title: t('Sozlamalar'),
      url: '/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <Sidebar
      collapsible="icon"
      className="px-2 [&_[data-sidebar=sidebar]]:bg-background [&_[data-sidebar=sidebar]]:border-r [&_[data-sidebar=sidebar]]:border-border"
      {...props}
    >
      <SidebarHeader className="pt-4">
        <img
          src="/assets/logos/uygaayt-store-admin.svg"
          alt={t('appName')}
          className="w-32 mx-auto group-data-[collapsible=icon]:hidden"
        />

        <img
          src="/assets/logos/uygaayt-shape.svg"
          alt={t('appName')}
          className="w-8 h-8 mx-auto hidden group-data-[collapsible=icon]:block"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="space-y-0.5 pt-4">
          {/* <SearchCommandDialog /> */}
          <SidebarGroupLabel className="hidden group-data-[collapsible=icon]:hidden">
            {t('mainMenu')}
          </SidebarGroupLabel>
          {navItems.map((item, i) => {
            let isActive = false;

            if (item.url === '/dashboard') {
              // faqat to‘liq mos kelsa
              isActive = location.pathname === item.url;
            } else {
              // qolganlar uchun boshlanishini tekshir
              isActive = location.pathname.startsWith(item.url);
            }

            return (
              <Link key={i} to={item.url}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={`flex items-center group-data-[collapsible=icon]:justify-center ${
                    isActive
                      ? 'bg-primary text-white dark:text-black hover:bg-primary/90 hover:text-white border-l-2 border-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-4 h-4 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
                  <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
                    {item.title}
                  </span>
                </SidebarMenuButton>
              </Link>
            );
          })}

          {/* <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Sozlamalar
          </SidebarGroupLabel>
          <Link to="/dashboard/settings">
            <SidebarMenuButton
              tooltip="Sozlamalar"
              className={`flex items-center group-data-[collapsible=icon]:justify-center ${
                location.pathname === '/dashboard/settings' ||
                location.pathname.startsWith('/dashboard/settings/')
                  ? 'bg-primary text-white hover:bg-primary/90 hover:text-white border-l-2 border-primary'
                  : 'hover:bg-muted'
              }`}
            >
              <Settings className="w-4 h-4 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
              <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">
                Sozlamalar
              </span>
            </SidebarMenuButton>
          </Link> */}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserSettings />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
