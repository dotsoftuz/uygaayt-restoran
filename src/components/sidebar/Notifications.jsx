import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useNotificationContext } from '@/context/NotificationContext';
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle,
  Clock,
  ShoppingCart,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FILTER_TABS = [
  { key: 'all', label: 'Hammasi' },
  { key: 'unread', label: "O'qilmagan" },
  { key: 'order', label: 'Buyurtmalar' },
  { key: 'complaint', label: 'Shikoyatlar' },
];

const getOrderStatusClassName = (statusText) => {
  const s = String(statusText || '').toLowerCase();
  if (!s) return 'text-muted-foreground';
  if (s.includes('qabul')) return 'text-orange-500';
  if (s.includes('yarat')) return 'text-blue-500';
  if (s.includes('ishlan') || s.includes('jarayon')) return 'text-yellow-600';
  if (s.includes('yetkaz')) return 'text-purple-500';
  if (s.includes('yakun') || s.includes('bajar') || s.includes('tugat'))
    return 'text-green-600';
  if (s.includes('bekor') || s.includes('cancel')) return 'text-red-600';
  if (s.includes('kutil')) return 'text-slate-500';
  return 'text-muted-foreground';
};

const renderNotificationMessage = (notification) => {
  const message = String(notification?.message || '');
  if (notification?.type !== 'order') return message;

  const match = message.match(/Status:\s*"([^"]+)"/);
  if (!match) return message;

  const statusText = match[1];
  const parts = message.split(match[0]);
  const before = parts[0];
  const after = parts.slice(1).join(match[0]);
  const statusClassName = getOrderStatusClassName(statusText);

  return (
    <>
      {before}
      {'Status: "'}
      <span className={statusClassName}>{statusText}</span>
      {'"'}
      {after}
    </>
  );
};

export function Notifications({ variant = 'auto' }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const {
    notifications,
    unreadCount,
    settings,
    markAsRead,
    markAllAsRead,
    removeNotification,
    updateSettings,
  } = useNotificationContext();

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

  // Filtrlangan bildirishnomalar
  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter((n) => n.unread);
      case 'order':
        return notifications.filter((n) => n.type === 'order');
      case 'complaint':
        return notifications.filter((n) => n.type === 'complaint');
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

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

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.orderId) {
      navigate(`/dashboard/order-detail/${notification.orderId}`);
    } else {
      navigate('/dashboard/orders');
    }
    setOpen(false);
  };

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  // Popover ichidagi content (header va sidebar uchun bir xil)
  const renderPopoverContent = () => (
    <PopoverContent
      className="w-[400px] p-0"
      side="bottom"
      align="end"
      sideOffset={8}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="font-semibold text-base">Bildirishnomalar</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {unreadCount} ta o'qilmagan
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Tovush tugmasi */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSound}
            className="h-7 w-7"
            title={
              settings.soundEnabled ? "Tovushni o'chirish" : 'Tovushni yoqish'
            }
          >
            {settings.soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
          {/* Hammasini o'qilgan deb belgilash */}
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={markAllAsRead}
              className="h-7 w-7"
              title="Hammasini o'qilgan deb belgilash"
            >
              <CheckCheck className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="h-7 w-7"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter tablar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b overflow-x-auto">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              activeFilter === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.label}
            {tab.key === 'unread' && unreadCount > 0 && (
              <span className="ml-1 text-[10px]">({unreadCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Bildirishnomalar ro'yxati */}
      <ScrollArea className="h-[360px]">
        <div className="p-2">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellOff className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {activeFilter === 'unread'
                  ? "O'qilmagan bildirishnomalar yo'q"
                  : activeFilter === 'order'
                    ? "Buyurtma bildirishnomalari yo'q"
                    : activeFilter === 'complaint'
                      ? "Shikoyat bildirishnomalari yo'q"
                      : "Bildirishnomalar yo'q"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                  notification.unread
                    ? 'bg-accent/50 hover:bg-accent'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div
                  className="flex items-start gap-3"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium leading-tight">
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {notification.unread && (
                          <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {renderNotificationMessage(notification)}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                      {/* O'chirish tugmasi - hover da ko'rinadi */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10"
                        title="O'chirish"
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
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
            Barcha buyurtmalarni ko'rish
          </Button>
        </div>
      )}
    </PopoverContent>
  );

  // Determine if used in header or sidebar
  const isInHeader =
    variant === 'header' || (variant === 'auto' && !sidebarState);

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
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-destructive-foreground ring-2 ring-background animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        {renderPopoverContent()}
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
              tooltip={
                sidebarState === 'collapsed' ? 'Bildirishnomalar' : undefined
              }
              className="relative data-[state=open]:text-sidebar-accent-foreground transition-all duration-200 rounded-full group-data-[collapsible=icon]:!size-12 group-data-[collapsible=icon]:!mx-auto overflow-visible"
            >
              <Bell className="w-4 h-4 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-medium text-destructive-foreground ring-2 ring-background animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </SidebarMenuButton>
          </PopoverTrigger>
          {renderPopoverContent()}
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
