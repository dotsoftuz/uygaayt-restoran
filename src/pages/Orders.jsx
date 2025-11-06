import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Phone,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumber, formatDate } from '@/lib/utils';

// Fake data
const generateFakeOrders = () => {
  const statuses = ['pending', 'processing', 'completed', 'cancelled'];
  const paymentTypes = ['cash', 'card', 'online'];
  const deliveryTypes = ['pickup', 'delivery'];
  const names = [
    'Ali Valiyev',
    'Dilshoda Karimova',
    'Javohir Toshmatov',
    'Malika Yusupova',
    'Sardor Rahimov',
    'Gulnoza Alimova',
    'Farhod Bekmurodov',
    'Nigora Toshmatova',
    'Bekzod Karimov',
    'Zarina Alimova',
    'Shohruh Valiyev',
    'Madina Yusupova',
    'Jasur Rahimov',
    'Dilbar Karimova',
    'Aziz Toshmatov',
  ];

  const orders = [];
  const now = new Date();

  for (let i = 1; i <= 50; i++) {
    const randomDate = new Date(
      now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000
    );
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
    const deliveryType = deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const phone = `+998${Math.floor(900000000 + Math.random() * 99999999)}`;
    const amount = Math.floor(Math.random() * 500000) + 50000;

    orders.push({
      id: `ORD-${String(i).padStart(6, '0')}`,
      clientName: name,
      phone: phone,
      amount: amount,
      paymentType: paymentType,
      status: status,
      deliveryType: deliveryType,
      createdAt: randomDate,
    });
  }

  return orders;
};

function Orders() {
  const navigate = useNavigate();
  const [fakeOrders] = useState(generateFakeOrders());

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...fakeOrders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.phone.includes(searchTerm) ||
          order.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Payment type filter
    if (paymentTypeFilter !== 'all') {
      filtered = filtered.filter(
        (order) => order.paymentType === paymentTypeFilter
      );
    }

    // Delivery type filter
    if (deliveryTypeFilter !== 'all') {
      filtered = filtered.filter(
        (order) => order.deliveryType === deliveryTypeFilter
      );
    }

    // Period filter
    if (periodFilter !== 'all') {
      const now = new Date();
      let startDate;

      switch (periodFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(
          (order) => new Date(order.createdAt) >= startDate
        );
      }
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (sortBy === 'highest') {
      filtered.sort((a, b) => b.amount - a.amount);
    }

    return filtered;
  }, [
    fakeOrders,
    searchTerm,
    statusFilter,
    paymentTypeFilter,
    deliveryTypeFilter,
    periodFilter,
    sortBy,
  ]);

  const handleView = (orderId) => {
    navigate(`/dashboard/order-detail/${orderId}`);
  };

  const handleContact = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Kutilmoqda', variant: 'secondary' },
      processing: { label: 'Jarayonda', variant: 'default' },
      completed: { label: 'Tugallangan', variant: 'default' },
      cancelled: { label: 'Bekor qilingan', variant: 'destructive' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  const getPaymentTypeLabel = (type) => {
    const labels = {
      cash: 'Naqd',
      card: 'Karta',
      online: 'Online',
    };
    return labels[type] || type;
  };

  const getDeliveryTypeLabel = (type) => {
    const labels = {
      pickup: 'Olib ketish',
      delivery: 'Yetkazib berish',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4 my-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Buyurtmalar</h2>
          <p className="text-muted-foreground">
            Barcha buyurtmalarni ko'rib chiqing va boshqaring
          </p>
        </div>
      </div>

      {/* Filters */}

      <div className="space-y-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ID, telefon yoki ism bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Holat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha holatlar</SelectItem>
              <SelectItem value="pending">Kutilmoqda</SelectItem>
              <SelectItem value="processing">Jarayonda</SelectItem>
              <SelectItem value="completed">Tugallangan</SelectItem>
              <SelectItem value="cancelled">Bekor qilingan</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Type Filter */}
          <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="To'lov turi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha to'lov turlari</SelectItem>
              <SelectItem value="cash">Naqd</SelectItem>
              <SelectItem value="card">Karta</SelectItem>
              <SelectItem value="online">Online</SelectItem>
            </SelectContent>
          </Select>

          {/* Delivery Type Filter */}
          <Select value={deliveryTypeFilter} onValueChange={setDeliveryTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Yetkazib berish" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha</SelectItem>
              <SelectItem value="pickup">Olib ketish</SelectItem>
              <SelectItem value="delivery">Yetkazib berish</SelectItem>
            </SelectContent>
          </Select>

          {/* Period Filter */}
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Davr" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha vaqt</SelectItem>
              <SelectItem value="today">Bugun</SelectItem>
              <SelectItem value="week">Oxirgi hafta</SelectItem>
              <SelectItem value="month">Oxirgi oy</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Eng yangilari</SelectItem>
              <SelectItem value="highest">Eng yuqori summa</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* Table */}
      <div>
        {/* <h3 className="text-lg font-bold tracking-tight mb-4">Buyurtmalar ro'yxati</h3> */}
        {filteredAndSortedOrders.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Mijoz ismi</TableHead>
                  <TableHead>Summa</TableHead>
                  <TableHead>To'lov turi</TableHead>
                  <TableHead>Yetkazib berish</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead>Vaqt</TableHead>
                  <TableHead className="text-right">Amal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.clientName}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {formatNumber(order.amount)} so'm
                      </span>
                    </TableCell>
                    <TableCell>{getPaymentTypeLabel(order.paymentType)}</TableCell>
                    <TableCell>
                      {getDeliveryTypeLabel(order.deliveryType)}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {order.createdAt instanceof Date
                        ? formatDate(order.createdAt.getTime())
                        : formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(order.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ko'rish
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleContact(order.phone)}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Hech qanday buyurtma topilmadi
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
