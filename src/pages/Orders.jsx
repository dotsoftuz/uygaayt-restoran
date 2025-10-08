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
} from 'lucide-react';
import { useOrders } from '@/hooks/use-orders';
import { formatNumber } from '@/lib/utils';

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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
    <div className="space-y-6 my-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buyurtmalar</h1>
          <p className="text-gray-600 mt-2">
            Barcha buyurtmalarni ko'rish va boshqarish
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yangi buyurtma
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Hali buyurtma yo'q
          </h3>
          <p className="text-gray-600 mb-4">
            Birinchi buyurtmani yaratish uchun boshlang
          </p>
          <Button
            onClick={handleCreateNew}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Buyurtma yaratish
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {order.mijozIsmi || 'N/A'}
                    </CardTitle>
                    <CardDescription>
                      {order.toyxona || "To'yxona yo'q"}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatDate(order.createdAt)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Client Info */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{order.mijozIsmi}</span>
                  </div>

                  {order.telefon && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{order.telefon}</span>
                    </div>
                  )}

                  {/* Event Date */}
                  {order.sana && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(order.sana)}</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatPrice(order.narx || 0)}</span>
                  </div>

                  {/* Services */}
                  {order.options && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Xizmatlar:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(order.options)
                          .filter(([_, selected]) => selected)
                          .slice(0, 3)
                          .map(([service, _]) => (
                            <Badge
                              key={service}
                              variant="secondary"
                              className="text-xs"
                            >
                              {service}
                            </Badge>
                          ))}
                        {Object.values(order.options).filter(Boolean).length >
                          3 && (
                          <Badge variant="outline" className="text-xs">
                            +
                            {Object.values(order.options).filter(Boolean)
                              .length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(order.id)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ko'rish
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(order.id)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Tahrir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(order.id)}
                      disabled={deletingId === order.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      {deletingId === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
