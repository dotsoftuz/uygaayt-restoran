import {
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  PlusCircle,
  Settings,
  UserCog,
  Users,
  FileText,
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
import { NavUser } from './NavUser';

export function AppSidebar({ ...props }) {
  const { user } = useAppContext();
  const location = useLocation();

  const navItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Yangi Buyurtma',
      url: '/dashboard/create-order',
      icon: PlusCircle,
    },
    {
      title: 'Buyurtmalar',
      url: '/dashboard/orders',
      icon: ClipboardList,
    },
    {
      title: 'Mijozlar',
      url: '/dashboard/clients',
      icon: Users,
    },
    {
      title: 'Xodimlar',
      url: '/dashboard/employees',
      icon: UserCog,
    },
    {
      title: 'Xizmatlar',
      url: '/dashboard/services',
      icon: Briefcase,
    },
    {
      title: 'Buyurtma shablonlari',
      url: '/dashboard/order-template',
      icon: FileText,
    },
  ];

  return (
    <Sidebar collapsible="icon" className="px-2" {...props}>
      <SidebarHeader>
        <h2 className="text-lg font-bold px-2">Creative Studio</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="space-y-0.5">
          <SidebarGroupLabel>Asosiy bo'limlar</SidebarGroupLabel>
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
                  className={`flex items-center ${
                    isActive
                      ? 'bg-primary text-white dark:text-black hover:bg-primary/90 hover:text-white border-l-2 border-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.title}</span>
                </SidebarMenuButton>
              </Link>
            );
          })}

          <SidebarGroupLabel>Sozlamalar</SidebarGroupLabel>
          <Link to="/dashboard/settings">
            <SidebarMenuButton
              tooltip="Sozlamalar"
              className={`flex items-center ${
                location.pathname === '/dashboard/settings' ||
                location.pathname.startsWith('/dashboard/settings/')
                  ? 'bg-primary text-white hover:bg-primary/90 hover:text-white border-l-2 border-primary'
                  : 'hover:bg-muted'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Sozlamalar</span>
            </SidebarMenuButton>
          </Link>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
