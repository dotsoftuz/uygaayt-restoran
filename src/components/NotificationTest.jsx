import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationContext } from '@/context/NotificationContext';
import { createOrder, updateOrderStatus } from '@/services/orders';
import { AlertTriangle, Bell, Settings, ShoppingCart } from 'lucide-react';

export default function NotificationTest() {
  const {
    addOrderNotification,
    addComplaintNotification,
    addNotification,
    notifications,
    playSound,
  } = useNotificationContext();

  const testOrderNotification = () => {
    addOrderNotification({
      id: `TEST-${Date.now()}`,
      customerName: 'Test Mijoz',
      totalAmount: 5000000,
      createdAt: new Date().toISOString(),
    });
  };

  const testComplaintNotification = () => {
    addComplaintNotification({
      id: `COMP-${Date.now()}`,
      clientName: 'Test Shikoyatchi',
      orderId: `ORD-${Date.now()}`,
      complaint: 'Test shikoyat matni',
    });
  };

  const testSound = () => {
    console.log('Test sound button clicked');
    playSound();
  };

  const testSystemNotification = () => {
    addNotification({
      type: 'system',
      title: 'Tizim xabari',
      message: 'Bu test tizim bildirishnomasi',
      priority: 'medium',
    });
  };

  const testCreateOrderAPI = async () => {
    try {
      await createOrder({
        clientName: 'API Test Mijoz',
        clientPhone: '+998901234567',
        totalAmount: 1000000,
        status: 'created',
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('API test error:', error);
    }
  };

  const testUpdateStatusAPI = async () => {
    try {
      await updateOrderStatus('TEST-123', 'inProcess', {
        clientName: 'Status Test Mijoz',
      });
    } catch (error) {
      console.error('Status update test error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Test Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={testOrderNotification}
          className="w-full"
          variant="outline"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Test Order Notification
        </Button>

        <Button
          onClick={testComplaintNotification}
          className="w-full"
          variant="outline"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Test Complaint Notification
        </Button>

        <Button
          onClick={testSystemNotification}
          className="w-full"
          variant="outline"
        >
          <Settings className="w-4 h-4 mr-2" />
          Test System Notification
        </Button>

        <Button onClick={testSound} className="w-full" variant="outline">
          <Bell className="w-4 h-4 mr-2" />
          Test Sound Only
        </Button>

        <div className="border-t pt-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            API Tests (real-time):
          </p>
          <Button
            onClick={testCreateOrderAPI}
            className="w-full"
            size="sm"
            variant="secondary"
          >
            Create Order (API)
          </Button>

          <Button
            onClick={testUpdateStatusAPI}
            className="w-full"
            size="sm"
            variant="secondary"
          >
            Update Status (API)
          </Button>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-2">
          Total notifications: {notifications.length}
        </div>
      </CardContent>
    </Card>
  );
}
