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

export function Notifications() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

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

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={state === 'collapsed' ? 'Bildirishnomalar' : undefined}
              className="relative data-[state=open]:text-sidebar-accent-foreground transition-all duration-200 rounded-full group-data-[collapsible=icon]:!size-12 group-data-[collapsible=icon]:!mx-auto overflow-visible"
            >
              <Bell className="w-4 h-4 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-0.5 -right-0.5 h-5 w-4 rounded-full p-0 flex items-center justify-center text-xs z-10 min-w-[20px]"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-0"
            side="bottom"
            align="end"
            sideOffset={8}
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Bildirishnomalar</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Shikoyat, muhim buyurtmalar haqida ogohlantirish
              </p>
            </div>

            <ScrollArea className="h-80">
              <div className="p-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Bildirishnomalar yo'q</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        notification.unread
                          ? 'bg-blue-50/50 border-l-4 border-l-blue-500'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getPriorityColor(notification.priority)}`}
                            >
                              {notification.priority === 'high'
                                ? 'Yuqori'
                                : notification.priority === 'medium'
                                  ? "O'rta"
                                  : 'Past'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {notification.time}
                            </span>
                            {notification.unread && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {notifications.length > 0 && (
              <div className="p-3 border-t">
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
