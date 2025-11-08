import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  ShoppingCart,
  Clock,
  CheckCircle,
  X,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

export function Notifications({ variant = 'auto' }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Get sidebar state - hook must be called unconditionally per React rules
  // If not in SidebarProvider context, this will throw, which we handle
  let sidebarState = null;
  let sidebarContext = null;
  try {
    sidebarContext = useSidebar();
    sidebarState = sidebarContext?.state;
  } catch (e) {
    // Not in sidebar context - this is expected when used in header
    // Hook is still called unconditionally, which satisfies React rules
    sidebarState = null;
    sidebarContext = null;
  }

  const notifications = [
    {
      id: 1,
      type: 'complaint',
      title: 'Shikoyat',
      message: 'Mijoz "Oq oy" to\'yxonasidan shikoyat bildirdi',
      time: '5 daqiqa oldin',
      unread: true,
      priority: 'high',
      orderId: 'ORD-001',
    },
    {
      id: 2,
      type: 'order',
      title: 'Muhim buyurtma',
      message: "Yangi VIP buyurtma qabul qilindi - 50,000,000 so'm",
      time: '15 daqiqa oldin',
      unread: true,
      priority: 'high',
      orderId: 'ORD-002',
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Eslatma',
      message: 'Bugun 3 ta buyurtma yetkazib berish kerak',
      time: '1 soat oldin',
      unread: true,
      priority: 'medium',
      orderId: null,
    },
    {
      id: 4,
      type: 'completed',
      title: 'Buyurtma yakunlandi',
      message: 'ORD-003 buyurtmasi muvaffaqiyatli yakunlandi',
      time: '2 soat oldin',
      unread: false,
      priority: 'low',
      orderId: 'ORD-003',
    },
    {
      id: 5,
      type: 'complaint',
      title: 'Shikoyat hal qilindi',
      message: 'ORD-004 shikoyati hal qilindi',
      time: '3 soat oldin',
      unread: false,
      priority: 'low',
      orderId: 'ORD-004',
    },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'complaint':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'order':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case 'reminder':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.orderId) {
      navigate(`/dashboard/order-detail/${notification.orderId}`);
    } else {
      navigate('/dashboard/orders');
    }
    setOpen(false);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Determine if used in header or sidebar
  const isInHeader = variant === 'header' || (variant === 'auto' && !sidebarState);

  if (isInHeader) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 mt-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Bildirishnomalar"
          >
            <Bell className="!h-6 !w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-destructive-foreground ring-2 ring-background">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[380px] p-0"
          side="bottom"
          align="end"
          sideOffset={8}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h3 className="font-semibold text-base">Bildirishnomalar</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {unreadCount} ta o'qilmagan
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="p-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Bildirishnomalar yo'q
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`relative p-3 rounded-lg cursor-pointer transition-colors mb-1 ${notification.unread
                        ? 'bg-accent/50 hover:bg-accent'
                        : 'hover:bg-muted/50'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium leading-tight">
                            {notification.title}
                          </h4>
                          {notification.unread && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-muted-foreground">
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {notifications.length > 0 && (
            <div className="border-t p-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  navigate('/dashboard/orders');
                  setOpen(false);
                }}
              >
                Barcha bildirishnomalarni ko'rish
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={sidebarState === 'collapsed' ? 'Bildirishnomalar' : undefined}
              className="relative data-[state=open]:text-sidebar-accent-foreground transition-all duration-200 rounded-full group-data-[collapsible=icon]:!size-12 group-data-[collapsible=icon]:!mx-auto overflow-visible"
            >
              <Bell className="w-4 h-4 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-destructive-foreground ring-2 ring-background">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent
            className="w-[380px] p-0"
            side="bottom"
            align="end"
            sideOffset={8}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h3 className="font-semibold text-base">Bildirishnomalar</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {unreadCount} ta o'qilmagan
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-7 w-7"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="p-2">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Bildirishnomalar yo'q
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`relative p-3 rounded-lg cursor-pointer transition-colors mb-1 ${notification.unread
                          ? 'bg-accent/50 hover:bg-accent'
                          : 'hover:bg-muted/50'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium leading-tight">
                              {notification.title}
                            </h4>
                            {notification.unread && (
                              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-muted-foreground">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {notifications.length > 0 && (
              <div className="border-t p-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    navigate('/dashboard/orders');
                    setOpen(false);
                  }}
                >
                  Barcha bildirishnomalarni ko'rish
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
