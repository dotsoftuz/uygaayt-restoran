import {
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  PlusCircle,
  Settings,
  UserCog,
  Users,
  FileText,
  Store,
  Apple,
  Truck,
  Users2,
  Target,
  ChartPie,
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
      title: "Do'konlar",
      url: '/dashboard/stores',
      icon: Store,
    },
    {
      title: 'Buyurtmalar',
      url: '/dashboard/orders',
      icon: ClipboardList,
    },
    {
      title: 'Tovarlar',
      url: '/dashboard/products',
      icon: Apple,
    },
    {
      title: 'Kuryerlar',
      url: '/dashboard/couriers',
      icon: Truck,
    },
    {
      title: 'Foydalanuvchilar',
      url: '/dashboard/users',
      icon: Users2,
    },
    {
      title: 'Marketing',
      url: '/dashboard/marketing',
      icon: Target,
    },
    {
      title: 'Analitika & Hisobotlar',
      url: '/dashboard/analytics',
      icon: ChartPie,
    },
  ];

  return (
    <Sidebar collapsible="icon" className="px-2" {...props}>
      <SidebarHeader className="pt-4">
        <img
          src="/assets/logos/uygaayt-super-admin.svg"
          alt="Creative Studio"
          className="w-32 mx-auto group-data-[collapsible=icon]:hidden"
        />

        <img
          src="/assets/logos/uygaayt-shape.svg"
          alt="Creative Studio"
          className="w-8 h-8 mx-auto hidden group-data-[collapsible=icon]:block"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="space-y-0.5">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Asosiy bo'limlar
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

          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
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
