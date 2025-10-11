import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Phone,
  DollarSign,
  Loader2,
  Search,
  CircleOff,
  Users,
  MoreHorizontal,
  Camera,
  Briefcase,
} from 'lucide-react';
import { useOrders } from '@/hooks/use-orders';
import { formatNumber, formatDate } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

function Orders() {
  const navigate = useNavigate();
  const { orders, loading, removeOrder } = useOrders();
  const [deletingId, setDeletingId] = useState(null);

  const handleCreateNew = () => {
    navigate('/dashboard/create-order');
  };

  const handleEdit = (orderId) => {
    navigate(`/dashboard/edit-order/${orderId}`);
  };

  const handleView = (orderId) => {
    navigate(`/dashboard/order-detail/${orderId}`);
  };

  const handleDelete = async (orderId) => {
    if (window.confirm("Bu buyurtmani o'chirishni xohlaysizmi?")) {
      setDeletingId(orderId);
      try {
        await removeOrder(orderId);
      } catch (error) {
        console.error('Error deleting order:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  console.log(orders[0]);

  const formatPrice = (price) => {
    return formatNumber(price) + " so'm";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span className="text-gray-500">Buyurtmalar yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Buyurtmalar ro'yxati
          </h2>
          <p className="text-muted-foreground">
            Tizimga yangi buyurtma qo'shish uchun "Buyurtma qo'shish" tugmasini
            bosing.
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          size="sm"
          className="flex items-center gap-2"
        >
          Yangi buyurtma
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buyurtmalarni qidirish..."
          // value={searchTerm}
          // onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-muted/50 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow transition-all duration-300"
            >
              {/* --- Upper badges --- */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Kamera soni */}
                  {order.kameraSoni && (
                    <span className="px-2 py-[2px] text-xs rounded-full shadow-sm bg-blue-100 text-blue-700 font-medium flex items-center gap-1">
                      <Camera className="h-3.5 w-3.5" />
                      {order.kameraSoni} ta kamera
                    </span>
                  )}

                  {/* Xizmatlar soni */}
                  {order.options && (
                    <span className="px-2 py-[2px] text-xs rounded-full bg-white border border-border shadow-sm black flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {Object.values(order.options).filter(Boolean).length} ta
                      xizmat
                    </span>
                  )}
                </div>
              </div>
              {/* --- Main content --- */}
              <div className="mb-4">
                <div className="flex items-center gap-2 pb-4">
                  <h3 className="text-xl font-semibold leading-tight">
                    {order.toyxona + " to'yxonasi" || "To'yxona ko‘rsatilmagan"}
                  </h3>
                  {order.sana && (
                    <span className="text-muted-foreground text- mt-0.5">
                      ({formatDate(order.sana)})
                    </span>
                  )}
                </div>

                {/* Qo‘shimcha joylar (nikoh, bazm, albom, pramoy efir) */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {order.nikoh && (
                    <Badge className="text-[14px] px-2 py-[2px] shadow-sm rounded-full bg-pink-50 hover:bg-pink-100 duration-300 text-pink-700 border border-pink-100">
                      Nikoh: {order.nikoh}
                    </Badge>
                  )}
                  {order.bazm && (
                    <Badge className="text-[14px] px-2 py-[2px] shadow-sm rounded-full bg-amber-50 hover:bg-amber-100 duration-300 text-amber-700 border border-amber-100">
                      Bazm: {order.bazm}
                    </Badge>
                  )}
                  {order.albom && (
                    <Badge className="text-[14px] px-2 py-[2px] shadow-sm rounded-full bg-indigo-50 hover:bg-indigo-100 duration-300 text-indigo-700 border border-indigo-100">
                      Albom: {order.albom}
                    </Badge>
                  )}
                  {order.pramoyEfir && (
                    <Badge className="text-[14px] px-2 py-[2px] shadow-sm rounded-full bg-green-50 hover:bg-green-100 duration-300 text-green-700 border border-green-100">
                      Pramoy efir
                    </Badge>
                  )}
                </div>

                {/* Asosiy xizmatlar */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {Object.entries(order.options)
                    .filter(([_, selected]) => selected)
                    .slice(0, 5)
                    .map(([service]) => (
                      <span
                        key={service}
                        className="text-[14px] px-2 py-[2px] rounded-full bg-white border border-border shadow-sm black"
                      >
                        {service}
                      </span>
                    ))}
                  {Object.values(order.options).filter(Boolean).length > 5 && (
                    <span className="text-[14px] px-2 py-[2px] rounded-full bg-white border border-border shadow-sm black">
                      +{Object.values(order.options).filter(Boolean).length - 5}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  {/* Initials avatar */}
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                    {order.mijozIsmi
                      ? order.mijozIsmi
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                      : 'N/A'}
                  </div>

                  {/* Client name & phone */}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">
                      {order.mijozIsmi || order.clientName || 'Noma’lum mijoz'}
                    </span>
                    {order.telefon && (
                      <span className="text-xs text-gray-500">
                        {order.telefon}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <span className="text-lg font-semibold whitespace-nowrap">
                  {formatPrice(order.narx || 0)}
                </span>
              </div>
              {/* Footerni shu yerga joylashtir  */}
              {/* Actions */}{' '}
              <div className="flex gap-2 pt-3 border-t border-border">
                {' '}
                <Button
                  size="sm"
                  onClick={() => handleView(order.id)}
                  className="flex-1"
                >
                  {' '}
                  <Eye className="h-4 w-4 mr-1" /> Ko'rish{' '}
                </Button>{' '}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(order.id)}
                  className="flex-1"
                >
                  {' '}
                  <Edit className="h-4 w-4 mr-1" /> Tahrir{' '}
                </Button>{' '}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(order.id)}
                  disabled={deletingId === order.id}
                  className="text-red-600 hover:text-red-700"
                >
                  {' '}
                  {deletingId === order.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}{' '}
                </Button>{' '}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 lg:py-12 border rounded-lg bg-muted/50">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleOff />
              </EmptyMedia>
              <EmptyTitle>Hali buyurtmalar mavjud emas!</EmptyTitle>
              <EmptyDescription>
                Yangi buyurtma qo‘shish uchun "Buyurtma qo‘shish" tugmasini
                bosing.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={handleCreateNew} size="sm">
                Buyurtma qo‘shish
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      )}
    </div>
  );
}

export default Orders;
