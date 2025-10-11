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
  Truck,
  MoreHorizontal,
  MapPin,
  Clock,
  Star,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

function Couriers() {
  const navigate = useNavigate();
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleCreateNew = () => {
    // navigate('/dashboard/create-courier');
    console.log('Create new courier');
  };

  const handleEdit = (courierId) => {
    // navigate(`/dashboard/edit-courier/${courierId}`);
    console.log('Edit courier:', courierId);
  };

  const handleView = (courierId) => {
    // navigate(`/dashboard/courier-detail/${courierId}`);
    console.log('View courier:', courierId);
  };

  const handleDelete = async (courierId) => {
    if (window.confirm("Bu kuryerni o'chirishni xohlaysizmi?")) {
      setDeletingId(courierId);
      try {
        // await removeCourier(courierId);
        console.log('Delete courier:', courierId);
      } catch (error) {
        console.error('Error deleting courier:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span className="text-gray-500">Kuryerlar yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Kuryerlar ro'yxati
          </h2>
          <p className="text-muted-foreground">
            Tizimga yangi kuryer qo'shish uchun "Kuryer qo'shish" tugmasini
            bosing.
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Yangi kuryer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Kuryerlarni qidirish..."
          className="pl-10"
        />
      </div>

      {couriers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {couriers.map((courier) => (
            <div
              key={courier.id}
              className="bg-muted/50 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-lg">{courier.name}</span>
                </div>
                <Badge
                  variant={
                    courier.status === 'active' ? 'default' : 'secondary'
                  }
                >
                  {courier.status === 'active' ? 'Faol' : 'Nofaol'}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{courier.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{courier.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Ish vaqti: {courier.workingHours}</span>
                </div>
                {courier.rating && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Reyting: {courier.rating}/5</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="h-4 w-4" />
                  <span>
                    Yetkazib berilgan: {courier.deliveredOrders || 0} ta
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <Button
                  size="sm"
                  onClick={() => handleView(courier.id)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" /> Ko'rish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(courier.id)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" /> Tahrir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(courier.id)}
                  disabled={deletingId === courier.id}
                  className="text-red-600 hover:text-red-700"
                >
                  {deletingId === courier.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 lg:py-12 border rounded-lg">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleOff />
              </EmptyMedia>
              <EmptyTitle>Hali kuryerlar mavjud emas!</EmptyTitle>
              <EmptyDescription>
                Yangi kuryer qo'shish uchun "Kuryer qo'shish" tugmasini bosing.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Kuryer qo'shish
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      )}
    </div>
  );
}

export default Couriers;
