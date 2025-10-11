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
  Apple,
  MoreHorizontal,
  Package,
  Star,
  ShoppingCart,
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

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleCreateNew = () => {
    // navigate('/dashboard/create-product');
    console.log('Create new product');
  };

  const handleEdit = (productId) => {
    // navigate(`/dashboard/edit-product/${productId}`);
    console.log('Edit product:', productId);
  };

  const handleView = (productId) => {
    // navigate(`/dashboard/product-detail/${productId}`);
    console.log('View product:', productId);
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Bu mahsulotni o'chirishni xohlaysizmi?")) {
      setDeletingId(productId);
      try {
        // await removeProduct(productId);
        console.log('Delete product:', productId);
      } catch (error) {
        console.error('Error deleting product:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span className="text-gray-500">Mahsulotlar yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Mahsulotlar ro'yxati
          </h2>
          <p className="text-muted-foreground">
            Tizimga yangi mahsulot qo'shish uchun "Mahsulot qo'shish" tugmasini
            bosing.
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Yangi mahsulot
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Mahsulotlarni qidirish..."
          className="pl-10"
        />
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-muted/50 border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Apple className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-lg">{product.name}</span>
                </div>
                <Badge
                  variant={
                    product.status === 'active' ? 'default' : 'secondary'
                  }
                >
                  {product.status === 'active' ? 'Faol' : 'Nofaol'}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="h-4 w-4" />
                  <span>Kategoriya: {product.category}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>Narx: {product.price} so'm</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Qoldiq: {product.stock} dona</span>
                </div>
                {product.rating && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Reyting: {product.rating}/5</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <Button
                  size="sm"
                  onClick={() => handleView(product.id)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" /> Ko'rish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product.id)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" /> Tahrir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingId === product.id}
                  className="text-red-600 hover:text-red-700"
                >
                  {deletingId === product.id ? (
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
              <EmptyTitle>Hali mahsulotlar mavjud emas!</EmptyTitle>
              <EmptyDescription>
                Yangi mahsulot qo'shish uchun "Mahsulot qo'shish" tugmasini
                bosing.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Mahsulot qo'shish
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      )}
    </div>
  );
}

export default Products;
