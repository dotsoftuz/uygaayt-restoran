import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Phone,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar,
  DollarSign,
  CreditCard,
  Truck,
  Package,
  Download,
  List,
  Grid3x3,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatNumber, formatDate, formatDateTime } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

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

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { label: 'Kutilmoqda', variant: 'secondary' },
    processing: { label: 'Jarayonda', variant: 'default' },
    completed: { label: 'Tugallangan', variant: 'default' },
    cancelled: { label: 'Bekor qilingan', variant: 'destructive' },
  };

  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
};

// Order Card Component (Mobile)
const OrderCard = ({ order, onView, onContact }) => {
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-semibold text-sm">
                {order.id}
              </span>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">{order.clientName}</p>
              <p className="text-xs text-muted-foreground">{order.phone}</p>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Details */}
        <div className="space-y-2 py-2 border-t">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Summa:
            </span>
            <span className="font-semibold">
              {formatNumber(order.amount)} so'm
            </span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              To'lov:
            </span>
            <span className="font-medium">
              {getPaymentTypeLabel(order.paymentType)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Truck className="h-3 w-3" />
              Yetkazib berish:
            </span>
            <span className="font-medium">
              {getDeliveryTypeLabel(order.deliveryType)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Vaqt:
            </span>
            <span className="font-medium text-xs">
              {order.createdAt instanceof Date
                ? formatDateTime(order.createdAt.getTime())
                : formatDateTime(order.createdAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(order.id)}
            className="flex-1 text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            Ko'rish
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onContact(order.phone)}
            className="flex-1 text-xs"
          >
            <Phone className="h-3 w-3 mr-1" />
            Qo'ng'iroq
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Order Table Row Component
const OrderTableRow = ({ order, isMobile, onView, onContact }) => {
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
    <TableRow 
      className="hover:bg-muted/50 cursor-pointer"
      onClick={() => onView(order.id)}
    >
      <TableCell className="font-mono font-medium text-xs sm:text-sm">
        <div className="truncate">{order.id}</div>
      </TableCell>
      <TableCell>
        <div className="min-w-0">
          <div className="font-medium text-sm sm:text-base truncate">
            {order.clientName}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground truncate">
            {order.phone}
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <span className="font-semibold text-sm sm:text-base truncate block">
          {formatNumber(order.amount)} so'm
        </span>
      </TableCell>
      <TableCell className="hidden md:table-cell text-sm">
        <div className="truncate">{getPaymentTypeLabel(order.paymentType)}</div>
      </TableCell>
      <TableCell>
        <StatusBadge status={order.status} />
      </TableCell>
      <TableCell className="hidden md:table-cell text-xs sm:text-sm">
        <div className="truncate">
          {order.createdAt instanceof Date
            ? formatDateTime(order.createdAt.getTime())
            : formatDateTime(order.createdAt)}
        </div>
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(order.id)}>
                <Eye className="h-4 w-4" />
                Ko'rish
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onContact(order.phone)}>
                <Phone className="h-4 w-4" />
                Qo'ng'iroq
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(order.id);
              }}
              className="h-7 w-7 sm:h-8 sm:w-auto px-2 sm:px-3"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onContact(order.phone);
              }}
              className="h-7 w-7 sm:h-8 sm:w-auto px-2 sm:px-3"
            >
              <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

function Orders() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState('table'); // Default to table/list view
  
  // YANGI: API dan orderlarni olish
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState(localStorage.getItem('storeId') || '');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Pagination states
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // YANGI: Backend order state dan frontend state ga o'tkazish
  const mapOrderState = (state) => {
    if (!state) return 'pending';
    const stateStr = state.state || state;
    switch (stateStr) {
      case 'created':
        return 'pending';
      case 'inProcess':
      case 'inDelivery':
        return 'processing';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  // YANGI: Backend order formatidan frontend formatiga o'tkazish
  const mapOrderFromBackend = (order) => {
    const customer = order.customer || order.receiverCustomer || {};
    const state = order.state || {};
    const deliveryType = order.type === 'immediate' ? 'delivery' : 'pickup';
    
    // Order ID ni formatlash - #23 ko'rinishida
    const orderId = order.number 
      ? `#${order.number}`
      : order._id || order.id || '#0';
    
    return {
      id: orderId,
      _id: order._id || order.id, // Backend ID ni saqlash
      clientName: customer.firstName 
        ? `${customer.firstName} ${customer.lastName || ''}`.trim()
        : customer.name || 'Noma\'lum mijoz',
      phone: customer.phoneNumber || customer.phone || '',
      amount: order.totalPrice || 0,
      paymentType: order.paymentType || 'cash',
      status: mapOrderState(state),
      deliveryType: deliveryType,
      createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
      number: order.number,
    };
  };

  // YANGI: API dan orderlarni olish
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Backend avtomatik ravishda token dan storeId ni oladi
        const params = {
          page: currentPage,
          limit: itemsPerPage,
        };
        
        // Status filter - backend state ga o'tkazish
        if (statusFilter !== 'all') {
          // Frontend status dan backend state ga map qilish
          const stateMap = {
            'pending': 'created',
            'processing': 'inProcess',
            'completed': 'completed',
            'cancelled': 'cancelled',
          };
          // Backend da state filter qo'shish kerak, lekin hozircha client-side filter qilamiz
        }
        
        const response = await api.post('/store/order/paging', params);
        
        // Backend response format: { data: [...], total: ... }
        const responseData = response?.data?.data || response?.data || [];
        const mappedOrders = Array.isArray(responseData) 
          ? responseData.map(mapOrderFromBackend)
          : [];
        
        setOrders(mappedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Xato bo'lsa, fake data ishlatish
        setOrders(generateFakeOrders());
        toast.error('Buyurtmalarni yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [storeId, currentPage, itemsPerPage, statusFilter]);

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    // Search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          order.phone.includes(debouncedSearchTerm) ||
          order.clientName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          (order.number && order.number.toString().includes(debouncedSearchTerm))
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
    orders,
    debouncedSearchTerm,
    statusFilter,
    paymentTypeFilter,
    deliveryTypeFilter,
    periodFilter,
    sortBy,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredAndSortedOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, paymentTypeFilter, deliveryTypeFilter, periodFilter, sortBy]);

  // Read filters and pagination from URL on mount
  useEffect(() => {
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const payment = searchParams.get('payment');
    const delivery = searchParams.get('delivery');
    const period = searchParams.get('period');
    const sort = searchParams.get('sort');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    
    if (search !== null) setSearchTerm(search);
    if (status !== null) setStatusFilter(status);
    if (payment !== null) setPaymentTypeFilter(payment);
    if (delivery !== null) setDeliveryTypeFilter(delivery);
    if (period !== null) setPeriodFilter(period);
    if (sort !== null) setSortBy(sort);
    if (page !== null) {
      const pageNum = parseInt(page, 10);
      if (pageNum >= 1) setCurrentPage(pageNum);
    }
    if (limit !== null) {
      const limitNum = parseInt(limit, 10);
      if ([10, 20, 30, 40, 50].includes(limitNum)) setItemsPerPage(limitNum);
    }
  }, []); // Only on mount

  // Update URL when filters change (using debounced search)
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (paymentTypeFilter !== 'all') params.set('payment', paymentTypeFilter);
    if (deliveryTypeFilter !== 'all') params.set('delivery', deliveryTypeFilter);
    if (periodFilter !== 'all') params.set('period', periodFilter);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    
    setSearchParams(params, { replace: true });
  }, [debouncedSearchTerm, statusFilter, paymentTypeFilter, deliveryTypeFilter, periodFilter, sortBy]);

  // Update URL when pagination changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    } else {
      params.delete('page');
    }
    
    if (itemsPerPage !== 20) {
      params.set('limit', itemsPerPage.toString());
    } else {
      params.delete('limit');
    }
    
    setSearchParams(params, { replace: true });
  }, [currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleView = (orderId) => {
    // Order ID yoki _id ni topish
    const order = orders.find(o => o.id === orderId || o._id === orderId);
    const actualId = order?._id || orderId;
    navigate(`/dashboard/order-detail/${actualId}`);
  };

  const handleContact = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Order ID', 'Mijoz ismi', 'Telefon', 'Summa', 'To\'lov turi', 'Yetkazib berish', 'Holat', 'Sana'].join(','),
        ...filteredAndSortedOrders.map((order) =>
          [
            order.id,
            order.clientName,
            order.phone,
            order.amount,
            order.paymentType,
            order.deliveryType,
            order.status,
            order.createdAt instanceof Date
              ? formatDateTime(order.createdAt.getTime())
              : formatDateTime(order.createdAt),
          ].join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'orders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV fayl yuklab olindi');
  };

  // Auto set view mode based on screen size
  useEffect(() => {
    if (isMobile) {
      setViewMode('card');
    }
  }, [isMobile]);

  const hasActiveFilters =
    statusFilter !== 'all' ||
    paymentTypeFilter !== 'all' ||
    deliveryTypeFilter !== 'all' ||
    periodFilter !== 'all';

  return (
    <div className="space-y-4 py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="title">Buyurtmalar</h2>
          <p className="paragraph">
            Barcha buyurtmalarni ko'rib chiqing va boshqaring
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="ID, telefon yoki ism bo'yicha qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-sm sm:text-base"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {isMobile ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="w-full"
          >
            <Package className="h-4 w-4 mr-2" />
            Filtrlar {hasActiveFilters && `(${[
              statusFilter !== 'all' ? 1 : 0,
              paymentTypeFilter !== 'all' ? 1 : 0,
              deliveryTypeFilter !== 'all' ? 1 : 0,
              periodFilter !== 'all' ? 1 : 0,
            ].reduce((a, b) => a + b, 0)})`}
          </Button>
        ) : null}

        {(!isMobile || filtersOpen) && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
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

            <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="To'lov turi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha to'lov turlari</SelectItem>
                <SelectItem value="cash">Naqd</SelectItem>
                <SelectItem value="card">Karta</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>

            <Select value={deliveryTypeFilter} onValueChange={setDeliveryTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Yetkazib berish" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha</SelectItem>
                <SelectItem value="pickup">Olib ketish</SelectItem>
                <SelectItem value="delivery">Yetkazib berish</SelectItem>
              </SelectContent>
            </Select>

            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Davr" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha vaqt</SelectItem>
                <SelectItem value="today">Bugun</SelectItem>
                <SelectItem value="week">Oxirgi hafta</SelectItem>
                <SelectItem value="month">Oxirgi oy</SelectItem>
              </SelectContent>
            </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Eng yangilari</SelectItem>
                <SelectItem value="highest">Eng yuqori summa</SelectItem>
              </SelectContent>
            </Select>

            {!isMobile && (
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="ml-auto">
                <Download className="w-4 h-4 mr-2" />
                CSV Export
              </Button>
            )}
            {!isMobile && (
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Orders List */}
      {loading ? (
        viewMode === 'card' || isMobile ? (
          // Card Skeleton Loading
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-20"></div>
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                  <div className="space-y-2 py-2 border-t">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <div className="h-8 bg-muted rounded flex-1"></div>
                    <div className="h-8 bg-muted rounded flex-1"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Table Skeleton Loading
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px] whitespace-nowrap">Order ID</TableHead>
                    <TableHead className="w-[180px] whitespace-nowrap">Mijoz ismi</TableHead>
                    <TableHead className="hidden sm:table-cell w-[120px] whitespace-nowrap">Summa</TableHead>
                    <TableHead className="hidden md:table-cell w-[110px] whitespace-nowrap">To'lov turi</TableHead>
                    <TableHead className="w-[110px] whitespace-nowrap">Holat</TableHead>
                    <TableHead className="hidden md:table-cell w-[130px] whitespace-nowrap">Vaqt</TableHead>
                    <TableHead className="text-right w-[140px] whitespace-nowrap">Amal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(10)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                          <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 bg-muted rounded w-20 animate-pulse"></div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <div className="h-7 w-7 bg-muted rounded animate-pulse"></div>
                          <div className="h-7 w-7 bg-muted rounded animate-pulse"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      ) : filteredAndSortedOrders.length > 0 ? (
        viewMode === 'card' || isMobile ? (
          // Card View (Mobile or Desktop Card Mode)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {paginatedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onView={handleView}
                onContact={handleContact}
              />
            ))}
          </div>
        ) : (
          // Table View (Desktop List Mode - Default)
          <Card className="overflow-hidden">
            <CardContent className="p-0 ">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px] whitespace-nowrap">Order ID</TableHead>
                    <TableHead className="w-[180px] whitespace-nowrap">Mijoz ismi</TableHead>
                    <TableHead className="hidden sm:table-cell w-[120px] whitespace-nowrap">Summa</TableHead>
                    <TableHead className="hidden md:table-cell w-[110px] whitespace-nowrap">To'lov turi</TableHead>
                    <TableHead className="w-[110px] whitespace-nowrap">Holat</TableHead>
                    <TableHead className="hidden md:table-cell w-[130px] whitespace-nowrap">Vaqt</TableHead>
                    <TableHead className="text-right w-[140px] whitespace-nowrap">Amal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <OrderTableRow
                      key={order.id}
                      order={order}
                      isMobile={isMobile}
                      onView={handleView}
                      onContact={handleContact}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>
              {searchTerm || hasActiveFilters
                ? 'Buyurtma topilmadi'
                : 'Hech qanday buyurtma yo\'q'}
            </EmptyTitle>
            <EmptyDescription>
              {searchTerm || hasActiveFilters
                ? 'Qidiruv yoki filtrlash natijasiga mos buyurtma topilmadi. Boshqa qidiruv so\'zlarini yoki filtrlarni sinab ko\'ring.'
                : 'Hali hech qanday buyurtma qo\'shilmagan. Yangi buyurtmalar shu yerda ko\'rinadi.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* Pagination */}
      {filteredAndSortedOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Sahifada ko'rsatish:
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-full sm:w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              {startIndex + 1}-{Math.min(endIndex, filteredAndSortedOrders.length)} dan{' '}
              {filteredAndSortedOrders.length} ta
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex-1 sm:flex-initial"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="text-xs sm:text-sm">Oldingi</span>
            </Button>
            <span className="text-xs sm:text-sm text-muted-foreground px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex-1 sm:flex-initial"
            >
              <span className="text-xs sm:text-sm">Keyingi</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
