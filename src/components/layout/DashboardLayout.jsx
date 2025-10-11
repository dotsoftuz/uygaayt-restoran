import React from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from 'lucide-react';

import { Separator } from '@/components/ui/separator';

import { AppSidebar } from '../sidebar/AppSidebar';
import CustomBreadcrumb from '../CustomBreadcrumb';
import { useFont } from '@/context/FontContext';
import { useAppContext } from '@/context/AppContext';
import { NavUser } from '../sidebar/NavUser';
import { Notifications } from '../sidebar/Notifications';

function DashboardLayout() {
  const { user } = useAppContext();
  const { font } = useFont();
  const location = useLocation();

  // Determine if we should show back button based on current route
  const shouldShowBackButton = () => {
    const pathSegments = location.pathname
      .replace('/dashboard', '')
      .split('/')
      .filter((segment) => segment);

    const [mainRoute, id] = pathSegments;

    // Show back button for detail pages and edit pages
    const detailPages = [
      'clients',
      'employees',
      'order-detail',
      'edit-order',
      'template-detail',
    ];
    return detailPages.includes(mainRoute) && !!id;
  };

  const showBackButton = shouldShowBackButton();

  return (
    <div style={{ fontFamily: font }}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b pr-2 lg:pr-4">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1 w-5 h-5" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <CustomBreadcrumb showBackButton={showBackButton} />
            </div>
            <div className="flex items-center gap-2">
              <Notifications />
              <NavUser user={user} />
            </div>
          </header>

          <div className="min-h-screen px-4 flex-1">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default DashboardLayout;
