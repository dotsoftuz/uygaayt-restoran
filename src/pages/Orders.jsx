'use client';

import OrderSheet from '@/components/dashboard/dialogs/OrderSheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Calendar,
  Camera,
  CheckCircle2,
  DollarSign,
  MapPin,
  Phone,
  Search,
  User,
} from 'lucide-react';
import { useState } from 'react';

export default function Orders() {
  const [orders, setOrders] = useState([
    {
      id: '1',
      toyxona: 'Samarkand Palace',
      nikoh: 'Oila Saroyi',
      bazm: 'Grand Hall',
      sana: '2025-03-15',
      kameraSoni: 3,
      telefon: '+998901234567',
      mijozIsmi: 'Aziz Rahimov',
      options: {
        nikoh: true,
        fotosessiya: true,
        bazm: true,
        chimilidq: false,
        elOshi: false,
        fotixaTuy: false,
        kelinSalom: true,
        qizBazm: false,
        loveStory: true,
      },
      albom: 'A4',
      fleshka: true,
      pramoyEfir: false,
      operatorlar: {
        opr1: 'Sardor',
        opr2: 'Javohir',
        ronin: 'Bobur',
        kran: '',
        camera360: '',
      },
      qoshimcha: {
        foto: 'Premium paket',
        nahor: '',
        kelinSalom: 'Maxsus',
        pramoyEfir: '',
        montaj: 'Standart',
      },
      narx: 15000000,
      status: 'Qabul qilindi',
    },
    {
      id: '2',
      toyxona: 'Tashkent Grand',
      nikoh: 'Oqsaroy',
      bazm: 'VIP Zal',
      sana: '2025-03-20',
      kameraSoni: 4,
      telefon: '+998907654321',
      mijozIsmi: 'Dilshod Karimov',
      options: {
        nikoh: true,
        fotosessiya: true,
        bazm: true,
        chimilidq: true,
        elOshi: true,
        fotixaTuy: false,
        kelinSalom: true,
        qizBazm: true,
        loveStory: true,
      },
      albom: '30x30',
      fleshka: true,
      pramoyEfir: true,
      operatorlar: {
        opr1: 'Sardor',
        opr2: 'Javohir',
        ronin: 'Bobur',
        kran: 'Anvar',
        camera360: 'Rustam',
      },
      qoshimcha: {
        foto: 'VIP paket',
        nahor: 'Bor',
        kelinSalom: 'Premium',
        pramoyEfir: 'YouTube',
        montaj: 'Premium',
      },
      narx: 25000000,
      status: "To'y boshlandi",
    },
    {
      id: '3',
      toyxona: 'Bukhara Hall',
      nikoh: 'Madina',
      bazm: 'Klassik Zal',
      sana: '2025-02-28',
      kameraSoni: 2,
      telefon: '+998909876543',
      mijozIsmi: 'Shohruh Aliyev',
      options: {
        nikoh: true,
        fotosessiya: true,
        bazm: false,
        chimilidq: false,
        elOshi: false,
        fotixaTuy: false,
        kelinSalom: false,
        qizBazm: false,
        loveStory: true,
      },
      albom: 'A3',
      fleshka: true,
      pramoyEfir: false,
      operatorlar: {
        opr1: 'Javohir',
        opr2: '',
        ronin: '',
        kran: '',
        camera360: '',
      },
      qoshimcha: {
        foto: 'Standart',
        nahor: '',
        kelinSalom: '',
        pramoyEfir: '',
        montaj: 'Standart',
      },
      narx: 8000000,
      status: 'Video editga berildi',
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredOrders = orders.filter((order) => {
    const search = debouncedSearch.toLowerCase();
    return (
      order.toyxona.toLowerCase().includes(search) ||
      order.mijozIsmi.toLowerCase().includes(search) ||
      order.telefon.includes(search) ||
      order.status.toLowerCase().includes(search)
    );
  });

  const handleCardClick = (order) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Qabul qilindi': 'bg-blue-500',
      "To'y boshlandi": 'bg-yellow-500',
      "To'y tugadi": 'bg-orange-500',
      'Video editga berildi': 'bg-purple-500',
      'Video edit tugadi': 'bg-indigo-500',
      'Buyurtma tamomlandi': 'bg-green-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getActiveServicesCount = (order) => {
    if (!order.options) return 0;
    return Object.values(order.options).filter(Boolean).length;
  };

  return (
    <div className="space-y-4 my-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buyurtmalarni qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.map((order) => (
          <Card
            key={order.id}
            className="group cursor-pointer overflow-hidden border-2 transition-all hover:border-primary hover:shadow-xl"
            onClick={() => handleCardClick(order)}
          >
            <CardHeader className="border-b bg-gradient-to-r from-background to-muted/20 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <CardTitle className="text-balance text-lg leading-tight">
                    {order.toyxona}
                  </CardTitle>
                </div>
                <Badge
                  className={`${getStatusColor(order.status)} flex-shrink-0 text-white`}
                >
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Mijoz:</span>
                <span className="ml-auto font-medium">{order.mijozIsmi}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Sana:</span>
                <span className="ml-auto font-medium">
                  {new Date(order.sana).toLocaleDateString('uz-UZ')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Telefon:</span>
                <span className="ml-auto font-medium">{order.telefon}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Camera className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Kamera:</span>
                <span className="ml-auto font-medium">
                  {order.kameraSoni} ta
                </span>
              </div>
              {getActiveServicesCount(order) > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Xizmatlar:</span>
                  <span className="ml-auto font-medium">
                    {getActiveServicesCount(order)} ta
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 border-t pt-3 text-sm">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Narx:</span>
                <span className="ml-auto text-lg font-bold text-primary">
                  {order.narx.toLocaleString('uz-UZ')} so'm
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Hech qanday buyurtma topilmadi
          </p>
        </div>
      )}

      {/* Order Details Sheet */}
      <OrderSheet
        order={selectedOrder}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
