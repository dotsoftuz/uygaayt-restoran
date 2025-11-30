import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  Send,
  FileText,
  DollarSign,
  Tag,
  Check,
  X,
  RefreshCw,
  MoreVertical,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { formatNumber, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

// Fake order data generator
const generateFakeOrder = (orderId) => {
  const statuses = ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'];
  const paymentStatuses = ['paid', 'unpaid'];
  const deliveryTypes = ['pickup', 'delivery'];

  const items = [
    { name: 'Lavash', variant: 'Katta', quantity: 2, price: 35000 },
    { name: 'Burger', variant: 'Kichik', quantity: 1, price: 25000 },
    { name: 'Pizza', variant: 'O\'rta', quantity: 1, price: 55000 },
    { name: 'Salat', variant: 'Katta', quantity: 1, price: 20000 },
  ];

  const events = [
    { status: 'accepted', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), note: 'Buyurtma qabul qilindi' },
    { status: 'preparing', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), note: 'Tayyorlanmoqda' },
  ];

  // Random promo code (sometimes applied)
  const appliedPromo = Math.random() > 0.5 ? {
    code: 'WELCOME10',
    type: 'percentage',
    discountValue: 10,
    discountAmount: 13500,
  } : null;

  return {
    id: orderId || 'ORD-000001',
    clientName: 'Ali Valiyev',
    phone: '+998901234567',
    address: 'Toshkent shahar, Yunusobod tumani, Amir Temur ko\'chasi, 15-uy',
    deliveryNotes: 'Uyning eshigi o\'ng tomonda, 3-qavat',
    items: items,
    paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
    transactionId: Math.random() > 0.5 ? `TXN-${Math.floor(Math.random() * 1000000)}` : null,
    status: 'preparing',
    deliveryType: deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)],
    events: events,
    internalNote: 'Mijoz maxsus talab qilgan',
    customerNote: 'Iltimos, tezroq yetkazib bering',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    appliedPromo: appliedPromo,
  };
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const configs = {
    pending: { label: 'Kutilmoqda', variant: 'secondary', icon: Clock },
    accepted: { label: 'Qabul qilindi', variant: 'default', icon: CheckCircle2 },
    preparing: { label: 'Tayyorlanmoqda', variant: 'default', icon: Package },
    ready: { label: 'Tayyor', variant: 'default', icon: CheckCircle2 },
    picked_up: { label: 'Olib ketildi', variant: 'default', icon: Truck },
    delivered: { label: 'Yetkazib berildi', variant: 'default', icon: CheckCircle2 },
    cancelled: { label: 'Bekor qilingan', variant: 'destructive', icon: XCircle },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1 text-xs sm:text-sm">
      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
      {config.label}
    </Badge>
  );
};

// Client Info Card Component
const ClientInfoCard = ({ order, onCall }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
          Mijoz ma'lumotlari
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div>
          <Label className="text-xs sm:text-sm text-muted-foreground">Ism</Label>
          <p className="font-medium text-sm sm:text-base mt-1">{order.clientName}</p>
        </div>
        <div>
          <Label className="text-xs sm:text-sm text-muted-foreground">Telefon</Label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
            <p className="font-medium text-sm sm:text-base">{order.phone}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCall(order.phone)}
              className="w-full sm:w-auto flex-shrink-0"
            >
              <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Qo'ng'iroq</span>
            </Button>
          </div>
        </div>
        {/* YANGI: Store ma'lumotlari */}
        {order.store && (
          <div>
            <Label className="text-xs sm:text-sm text-muted-foreground">Do'kon</Label>
            <p className="font-medium text-sm sm:text-base mt-1">{order.store.name || order.storeId || '-'}</p>
            {order.store.phoneNumber && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{order.store.phoneNumber}</p>
            )}
          </div>
        )}
        <div>
          <Label className="text-xs sm:text-sm text-muted-foreground">Manzil</Label>
          <p className="font-medium text-sm sm:text-base mt-1 break-words">{order.address}</p>
          {order.deliveryType === 'delivery' && (
            <div className="mt-2 rounded-lg overflow-hidden border">
              <iframe
                width="100%"
                height="200"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(order.address)}&output=embed`}
                className="w-full"
              />
            </div>
          )}
        </div>
        {order.deliveryNotes && (
          <div>
            <Label className="text-xs sm:text-sm text-muted-foreground">
              Yetkazib berish eslatmalari
            </Label>
            <p className="text-xs sm:text-sm mt-1 break-words">{order.deliveryNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Order Items Card Component
const OrderItemsCard = ({ items, appliedPromo, subtotal, discountAmount, totalAmount }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Package className="w-4 h-4 sm:w-5 sm:h-5" />
          Buyurtma itemlari
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 sm:p-3 border rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">{item.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {item.variant} • {item.quantity} ta
                </p>
              </div>
              <p className="font-semibold text-sm sm:text-base ml-2 flex-shrink-0">
                {formatNumber(item.price * item.quantity)} so'm
              </p>
            </div>
          ))}
          <Separator />
          {appliedPromo && (
            <>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-muted-foreground">
                    Promo kod ({appliedPromo.code})
                  </span>
                </div>
                <span className="text-primary font-medium">
                  -{formatNumber(discountAmount)} so'm
                </span>
              </div>
              <Separator />
            </>
          )}
          <div className="flex items-center justify-between font-bold text-base sm:text-lg pt-1">
            <span>Jami:</span>
            <span>{formatNumber(totalAmount)} so'm</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Payment Info Card Component
const PaymentInfoCard = ({ paymentStatus, transactionId }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          To'lov ma'lumotlari
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs sm:text-sm text-muted-foreground">Holat</Label>
          <Badge
            variant={paymentStatus === 'paid' ? 'default' : 'destructive'}
            className="text-xs"
          >
            {paymentStatus === 'paid' ? 'To\'langan' : 'To\'lanmagan'}
          </Badge>
        </div>
        {transactionId && (
          <div className="flex items-center justify-between">
            <Label className="text-xs sm:text-sm text-muted-foreground">
              Transaction ID
            </Label>
            <p className="font-mono text-xs sm:text-sm truncate ml-2">{transactionId}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Timeline Component
const OrderTimeline = ({ events, currentStatus }) => {
  const getTimelineStatus = (status) => {
    const statuses = ['accepted', 'preparing', 'picked_up', 'delivered'];
    return statuses.indexOf(status);
  };

  const statusLabels = {
    accepted: 'Qabul qilindi',
    preparing: 'Tayyorlanmoqda',
    picked_up: 'Olib ketildi',
    delivered: 'Yetkazib berildi',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          Buyurtma holati
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {['accepted', 'preparing', 'picked_up', 'delivered'].map(
            (status, index) => {
              const event = events.find((e) => e.status === status);
              const isCompleted = getTimelineStatus(currentStatus) >= index;
              const isCurrent = getTimelineStatus(currentStatus) === index;

              return (
                <div key={status} className="flex items-start gap-2 sm:gap-3">
                  <div
                    className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex-shrink-0 ${isCompleted
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted border-muted-foreground'
                      }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium text-sm sm:text-base ${isCurrent ? 'text-primary' : ''
                        }`}
                    >
                      {statusLabels[status]}
                    </p>
                    {event && (
                      <p className="text-xs sm:text-sm text-muted-foreground break-words">
                        {formatDate(event.timestamp.getTime())} • {event.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Actions Card Component
const ActionsCard = ({ order, onAccept, onReject, onMarkAsReady, onMarkAsPickedUp, onMarkAsDelivered, onRefundRequest, isMobile }) => {
  const actions = [];

  if (order.status === 'pending') {
    actions.push(
      <Button key="accept" className="w-full" onClick={onAccept}>
        <Check className="w-4 h-4" />
        <span className="text-xs sm:text-sm">Qabul qilish</span>
      </Button>,
      <Button
        key="reject"
        variant="destructive"
        className="w-full"
        onClick={onReject}
      >
        <X className="w-4 h-4" />
        <span className="text-xs sm:text-sm">Rad etish</span>
      </Button>
    );
  } else if (order.status === 'accepted') {
    actions.push(
      <Button key="ready" className="w-full" onClick={onMarkAsReady}>
        <Package className="w-4 h-4" />
        <span className="text-xs sm:text-sm">Tayyor deb belgilash</span>
      </Button>
    );
  } else if (order.status === 'ready') {
    actions.push(
      <Button key="picked" className="w-full" onClick={onMarkAsPickedUp}>
        <Truck className="w-4 h-4" />
        <span className="text-xs sm:text-sm">Olib ketildi deb belgilash</span>
      </Button>
    );
  } else if (order.status === 'picked_up') {
    actions.push(
      <Button key="delivered" className="w-full" onClick={onMarkAsDelivered}>
        <CheckCircle2 className="w-4 h-4" />
        <span className="text-xs sm:text-sm">Yetkazib berildi deb belgilash</span>
      </Button>
    );
  } else if (order.status === 'delivered' && order.paymentStatus === 'paid') {
    actions.push(
      <Button
        key="refund"
        variant="outline"
        className="w-full"
        onClick={onRefundRequest}
      >
        <RefreshCw className="w-4 h-4" />
        <span className="text-xs sm:text-sm">Pul qaytarish so'rovi</span>
      </Button>
    );
  }

  if (actions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">Amallar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions}
      </CardContent>
    </Card>
  );
};

// Notes Card Component
const NotesCard = ({ internalNote, customerNote, onInternalNoteChange, onCustomerNoteChange, onSave }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          Eslatmalar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div>
          <Label htmlFor="internal-note" className="text-xs sm:text-sm">
            Ichki eslatma (faqat do'kon)
          </Label>
          <Textarea
            id="internal-note"
            value={internalNote}
            onChange={(e) => onInternalNoteChange(e.target.value)}
            placeholder="Ichki eslatma..."
            className="mt-1 text-xs sm:text-sm min-h-[80px]"
          />
        </div>
        <div>
          <Label htmlFor="customer-note" className="text-xs sm:text-sm">
            Mijoz eslatmasi
          </Label>
          <Textarea
            id="customer-note"
            value={customerNote}
            onChange={(e) => onCustomerNoteChange(e.target.value)}
            placeholder="Mijoz eslatmasi..."
            className="mt-1 text-xs sm:text-sm min-h-[80px]"
          />
        </div>
        <Button className="w-full" onClick={onSave} size="sm">
          <span className="text-xs sm:text-sm">Saqlash</span>
        </Button>
      </CardContent>
    </Card>
  );
};

// Notifications Card Component
const NotificationsCard = ({ onResendNotification, isMobile }) => {
  if (isMobile) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            Xabarnomalar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            size="sm"
            onClick={() => onResendNotification('courier')}
          >
            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">Kuryerga qayta yuborish</span>
          </Button>
          <Button
            variant="outline"
            className="w-full"
            size="sm"
            onClick={() => onResendNotification('customer')}
          >
            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">Mijozga qayta yuborish</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          Xabarnomalar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          size="sm"
          onClick={() => onResendNotification('courier')}
        >
          <Send className="w-4 h-4" />
          <span className="text-xs sm:text-sm">Kuryerga qayta yuborish</span>
        </Button>
        <Button
          variant="outline"
          className="w-full"
          size="sm"
          onClick={() => onResendNotification('customer')}
        >
          <Send className="w-4 h-4" />
          <span className="text-xs sm:text-sm">Mijozga qayta yuborish</span>
        </Button>
      </CardContent>
    </Card>
  );
};

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [order] = useState(generateFakeOrder(orderId));
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [internalNote, setInternalNote] = useState(order.internalNote || '');
  const [customerNote, setCustomerNote] = useState(order.customerNote || '');

  const handleBack = () => {
    navigate('/dashboard/orders');
  };

  const handleCall = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleAccept = () => {
    order.events.push({
      status: 'accepted',
      timestamp: new Date(),
      note: 'Buyurtma qabul qilindi',
    });
    order.status = 'accepted';
    toast.success('Buyurtma qabul qilindi');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Sababni kiriting');
      return;
    }
    order.events.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: `Bekor qilindi: ${rejectReason}`,
    });
    order.status = 'cancelled';
    setRejectDialogOpen(false);
    setRejectReason('');
    toast.success('Buyurtma bekor qilindi');
  };

  const handleMarkAsReady = () => {
    order.events.push({
      status: 'ready',
      timestamp: new Date(),
      note: 'Tayyor',
    });
    order.status = 'ready';
    toast.success('Buyurtma tayyor deb belgilandi');
  };

  const handleMarkAsPickedUp = () => {
    order.events.push({
      status: 'picked_up',
      timestamp: new Date(),
      note: 'Olib ketildi',
    });
    order.status = 'picked_up';
    toast.success('Buyurtma olib ketildi deb belgilandi');
  };

  const handleMarkAsDelivered = () => {
    order.events.push({
      status: 'delivered',
      timestamp: new Date(),
      note: 'Yetkazib berildi',
    });
    order.status = 'delivered';
    toast.success('Buyurtma yetkazib berildi deb belgilandi');
  };

  const handleRefundRequest = () => {
    toast.info('Pul qaytarish so\'rovi yuborildi');
  };

  const handleResendNotification = (type) => {
    if (type === 'courier') {
      toast.success('Kuryerga xabar qayta yuborildi');
    } else {
      toast.success('Mijozga xabar qayta yuborildi');
    }
  };

  const handleSaveNotes = () => {
    order.internalNote = internalNote;
    order.customerNote = customerNote;
    toast.success('Eslatmalar saqlandi');
  };

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = order.appliedPromo?.discountAmount || 0;
  const totalAmount = subtotal - discountAmount;

  return (
    <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">

          <div className="min-w-0 flex-1">
            <h2 className="title truncate">
              Buyurtma #{order.id}
            </h2>
            <p className="paragraph">
              {formatDate(order.createdAt.getTime())}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <ClientInfoCard order={order} onCall={handleCall} />
          <OrderItemsCard
            items={order.items}
            appliedPromo={order.appliedPromo}
            subtotal={subtotal}
            discountAmount={discountAmount}
            totalAmount={totalAmount}
          />
          <PaymentInfoCard
            paymentStatus={order.paymentStatus}
            transactionId={order.transactionId}
          />
          <OrderTimeline events={order.events} currentStatus={order.status} />
        </div>

        {/* Right Column - Actions & Notes */}
        <div className="space-y-4 sm:space-y-6">
          <ActionsCard
            order={order}
            onAccept={handleAccept}
            onReject={() => setRejectDialogOpen(true)}
            onMarkAsReady={handleMarkAsReady}
            onMarkAsPickedUp={handleMarkAsPickedUp}
            onMarkAsDelivered={handleMarkAsDelivered}
            onRefundRequest={handleRefundRequest}
            isMobile={isMobile}
          />
          <NotesCard
            internalNote={internalNote}
            customerNote={customerNote}
            onInternalNoteChange={setInternalNote}
            onCustomerNoteChange={setCustomerNote}
            onSave={handleSaveNotes}
          />
          <NotificationsCard
            onResendNotification={handleResendNotification}
            isMobile={isMobile}
          />
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Buyurtmani rad etish</DialogTitle>
            <DialogDescription>
              Buyurtmani rad etish sababini kiriting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason" className="text-xs sm:text-sm">Sabab</Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Rad etish sababini kiriting..."
                className="mt-1 text-xs sm:text-sm min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason('');
              }}
              className="w-full sm:w-auto"
            >
              Bekor qilish
            </Button>
            <Button variant="destructive" onClick={handleReject} className="w-full sm:w-auto">
              Rad etish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrderDetail;
