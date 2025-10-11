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
  Layers,
  PlusCircle,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useOrders } from '@/hooks/use-orders';
import { formatDate } from '@/lib/utils';

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
    <div className="space-y-4 my-2">
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Buyurtma tafsilotlari
          </h2>
          <p className="text-muted-foreground">
            {order.mijozIsmi} — {order.toyxona}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Tahrirlash
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            O‘chirish
          </Button>
        </div>
      </div>

      {/* --- Top Info Badges --- */}
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <span className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded-full bg-purple-50 text-purple-700">
          <Layers className="h-4 w-4" />
          {Object.values(order.options || {}).filter(Boolean).length || 0} ta
          xizmat
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded-full bg-green-50 text-green-700">
          <Camera className="h-4 w-4" />
          {order.kameraSoni || 0} ta kamera
        </span>
        {order.sana && (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded-full bg-blue-50 text-blue-700">
            <Calendar className="h-4 w-4" />
            {formatDate(order.sana)}
          </span>
        )}
      </div>

      {/* --- Main Card --- */}
      <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Buyurtma ma’lumotlari
          </CardTitle>
          <CardDescription className="text-sm">
            Buyurtma {order.mijozIsmi} tomonidan {order.toyxona} joyida
            berilgan.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* --- Mijoz ma’lumotlari --- */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
            <h3 className="text-base font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Mijoz ma’lumotlari
            </h3>
            <div className="space-y-2 text-sm text-gray-800">
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
                <p className="text-gray-600">Mijoz ID: {order.clientId}</p>
              )}
            </div>
          </div>

          {/* --- Tadbir ma’lumotlari --- */}
          <div className="bg-green-50/50 border border-green-100 rounded-xl p-5">
            <h3 className="text-base font-semibold text-green-800 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Tadbir ma’lumotlari
            </h3>
            <div className="space-y-2 text-sm text-gray-800">
              <p>
                <span className="font-medium">Joy:</span> {order.toyxona}
              </p>
              {order.nikoh && (
                <p>
                  <span className="font-medium">Nikoh:</span> {order.nikoh}
                </p>
              )}
              {order.bazm && (
                <p>
                  <span className="font-medium">Bazm:</span> {order.bazm}
                </p>
              )}
            </div>
          </div>

          {/* --- Xizmatlar --- */}
          {order.options && (
            <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-5">
              <h3 className="text-base font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Tanlangan xizmatlar
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(order.options)
                  .filter(([_, selected]) => selected)
                  .map(([service]) => (
                    <Badge
                      key={service}
                      variant="secondary"
                      className="text-sm"
                    >
                      {service}
                    </Badge>
                  ))}
                {Object.values(order.options).filter(Boolean).length === 0 && (
                  <p className="text-gray-500 text-sm">
                    Hech qanday xizmat tanlanmagan
                  </p>
                )}
              </div>
            </div>
          )}

          {/* --- Qo‘shimcha xizmatlar --- */}
          <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-5">
            <h3 className="text-base font-semibold text-purple-800 mb-3 flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Qo‘shimcha xizmatlar
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>Albom o‘lchami:</span>
                <Badge variant="outline">{order.albom || 'Noma’lum'}</Badge>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={order.fleshka || false}
                    disabled
                  />
                  <span>Fleshkaga yozish</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={order.pramoyEfir || false}
                    disabled
                  />
                  <span>Pramoy efir</span>
                </label>
              </div>
            </div>
          </div>

          {/* --- Narx ma’lumotlari --- */}
          <div className="bg-gray-50 border border-border rounded-xl p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Narx ma’lumotlari
            </h3>
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Jami:</span>
              <span className="text-green-600">{formatPrice(order.narx)}</span>
            </div>
            <div className="mt-3 text-sm text-gray-500 space-y-1">
              {order.createdAt && (
                <p>Yaratilgan: {formatDate(order.createdAt)}</p>
              )}
              {order.updatedAt && (
                <p>Yangilangan: {formatDate(order.updatedAt)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OrderDetail;
