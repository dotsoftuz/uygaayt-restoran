import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Phone,
  Calendar,
  DollarSign,
  MapPin,
  Camera,
  Loader2,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useOrders } from '@/hooks/use-orders';

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { clients } = useAppContext();
  const { getOrderById, removeOrder } = useOrders();

  const order = getOrderById(orderId);

  const handleEdit = () => {
    navigate(`/dashboard/edit-order/${orderId}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Bu buyurtmani o'chirishni xohlaysizmi?")) {
      try {
        await removeOrder(orderId);
        navigate('/dashboard/orders');
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    return (
      price
        ?.toLocaleString('uz-UZ', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
        .replace(/,/g, ' ') + " so'm" || "0 so'm"
    );
  };

  const getClientName = (clientId) => {
    if (!clientId) return 'N/A';
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : 'N/A';
  };

  if (!order) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span className="text-gray-500">Buyurtma yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 my-4">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/orders')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Orqaga
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            Buyurtma tafsilotlari
          </h1>
          <p className="text-gray-600 mt-1">
            {order.mijozIsmi} - {order.toyxona}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Tahrirlash
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="text-red-600 hover:text-red-700 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            O'chirish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Mijoz ma'lumotlari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{order.mijozIsmi}</span>
            </div>
            {order.telefon && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{order.telefon}</span>
              </div>
            )}
            {order.clientId && (
              <div className="text-sm text-gray-600">
                Mijoz ID: {order.clientId}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tadbir ma'lumotlari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{order.toyxona}</span>
            </div>
            {order.nikoh && (
              <div className="text-sm">
                <span className="text-gray-500">Nikoh:</span> {order.nikoh}
              </div>
            )}
            {order.bazm && (
              <div className="text-sm">
                <span className="text-gray-500">Bazm:</span> {order.bazm}
              </div>
            )}
            {order.sana && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatDate(order.sana)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-gray-500" />
              <span>Kamera soni: {order.kameraSoni}</span>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>Xizmatlar</CardTitle>
            <CardDescription>Tanlangan xizmatlar ro'yxati</CardDescription>
          </CardHeader>
          <CardContent>
            {order.options ? (
              <div className="space-y-2">
                {Object.entries(order.options)
                  .filter(([_, selected]) => selected)
                  .map(([service, _]) => (
                    <Badge key={service} variant="secondary" className="mr-2">
                      {service}
                    </Badge>
                  ))}
                {Object.values(order.options).filter(Boolean).length === 0 && (
                  <p className="text-gray-500 text-sm">
                    Hech qanday xizmat tanlanmagan
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Xizmatlar ma'lumoti yo'q</p>
            )}
          </CardContent>
        </Card>

        {/* Additional Services */}
        <Card>
          <CardHeader>
            <CardTitle>Qo'shimcha xizmatlar</CardTitle>
            <CardDescription>
              Albom va boshqa qo'shimcha xizmatlar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Albom o'lchami:</span>
              <Badge variant="outline">{order.albom || 'N/A'}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={order.fleshka || false}
                  disabled
                  className="rounded"
                />
                <span className="text-sm">Fleshkaga yozish</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={order.pramoyEfir || false}
                  disabled
                  className="rounded"
                />
                <span className="text-sm">Pramoy efir</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Narx ma'lumotlari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Jami narx:</span>
              <span className="text-green-600">{formatPrice(order.narx)}</span>
            </div>
            {order.createdAt && (
              <div className="mt-4 text-sm text-gray-500">
                Yaratilgan: {formatDate(order.createdAt)}
              </div>
            )}
            {order.updatedAt && (
              <div className="text-sm text-gray-500">
                Yangilangan: {formatDate(order.updatedAt)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operators (if available) */}
        {order.operatorlar &&
          Object.values(order.operatorlar).some((op) => op) && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Operatorlar</CardTitle>
                <CardDescription>Tadbir operatorlari ro'yxati</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(order.operatorlar).map(
                    ([role, name]) =>
                      name && (
                        <div key={role} className="text-sm">
                          <span className="text-gray-500 capitalize">
                            {role}:
                          </span>
                          <span className="ml-2 font-medium">{name}</span>
                        </div>
                      )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Additional Fields (if available) */}
        {order.qoshimcha &&
          Object.values(order.qoshimcha).some((field) => field) && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Qo'shimcha maydonlar</CardTitle>
                <CardDescription>Boshqa qo'shimcha ma'lumotlar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(order.qoshimcha).map(
                    ([field, value]) =>
                      value && (
                        <div key={field} className="text-sm">
                          <span className="text-gray-500 capitalize">
                            {field}:
                          </span>
                          <span className="ml-2">{value}</span>
                        </div>
                      )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}

export default OrderDetail;
