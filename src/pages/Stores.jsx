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
  Store,
  MoreHorizontal,
  MapPin,
  Clock,
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

function Stores() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleCreateNew = () => {
    // navigate('/dashboard/create-store');
    console.log('Create new store');
  };

  const handleEdit = (storeId) => {
    // navigate(`/dashboard/edit-store/${storeId}`);
    console.log('Edit store:', storeId);
  };

  const handleView = (storeId) => {
    // navigate(`/dashboard/store-detail/${storeId}`);
    console.log('View store:', storeId);
  };

  const handleDelete = async (storeId) => {
    if (window.confirm("Bu do'konni o'chirishni xohlaysizmi?")) {
      setDeletingId(storeId);
      try {
        // await removeStore(storeId);
        console.log('Delete store:', storeId);
      } catch (error) {
        console.error('Error deleting store:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span className="text-gray-500">Do'konlar yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Do'konlar ro'yxati
          </h2>
          <p className="text-muted-foreground">
            Tizimga yangi do'kon qo'shish uchun "Do'kon qo'shish" tugmasini
            bosing.
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Yangi do'kon
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Do'konlarni qidirish..."
          className="pl-10"
        />
      </div>

      {stores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-muted/50 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-lg">{store.name}</span>
                </div>
                <Badge
                  variant={store.status === 'active' ? 'default' : 'secondary'}
                >
                  {store.status === 'active' ? 'Faol' : 'Nofaol'}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{store.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{store.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{store.workingHours}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <Button
                  size="sm"
                  onClick={() => handleView(store.id)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" /> Ko'rish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(store.id)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" /> Tahrir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(store.id)}
                  disabled={deletingId === store.id}
                  className="text-red-600 hover:text-red-700"
                >
                  {deletingId === store.id ? (
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
        <div className="text-center py-8 lg:py-12 border rounded-lg bg-muted/50">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleOff />
              </EmptyMedia>
              <EmptyTitle>Hali do'konlar mavjud emas!</EmptyTitle>
              <EmptyDescription>
                Yangi do'kon qo'shish uchun "Do'kon qo'shish" tugmasini bosing.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Do'kon qo'shish
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      )}
    </div>
  );
}

export default Stores;
