import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Package,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Plus,
  Eye,
  DollarSign,
  ArrowRight,
  Clock,
  XCircle,
  CheckCircle,
  ShoppingCart,
  Ticket,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import api from '@/services/api';
import { toast } from 'sonner';
import DashboardMap from './DashboardMap';

const chartConfig = {
  completed: {
    label: 'Bajarilgan',
    color: '#22c55e',
  },
  cancelled: {
    label: 'Bekor qilingan',
    color: '#ef4444',
  },
  total: {
    label: 'Umumiy',
    color: '#3b82f6',
  },
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    const fetchStoreName = () => {
      try {
        const storeDataStr = localStorage.getItem('storeData');
        if (storeDataStr) {
          const storeData = JSON.parse(storeDataStr);
          setStoreName(storeData.name || storeData.legalName || '');
        }
      } catch (error) {
        console.error('Error parsing store data:', error);
      }
    };

    fetchStoreName();

    const handleStorageChange = () => {
      fetchStoreName();
    };

    window.addEventListener('localStorageChange', handleStorageChange);
    return () => {
      window.removeEventListener('localStorageChange', handleStorageChange);
    };
  }, []);

  const [dateRange, setDateRange] = useState(() => {
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    if (dateFrom && dateTo) {
      return {
        from: new Date(dateFrom),
        to: new Date(dateTo),
      };
    }
    return null;
  });

  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    productsSold: 0,
    storeViewsCount: 0,
    areaChartData: [],
    orderLocations: [],
  });

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 200,
      };

      if (dateRange?.from && dateRange?.to) {
        params.dateFrom = dateRange.from.toISOString();
        params.dateTo = dateRange.to.toISOString();
      }

      const [ordersResponse, statisticsResponse] = await Promise.all([
        api.post('/store/order/paging', params),
        api.post('/store/statistics', {
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        }),
      ]);

      const orders = ordersResponse?.data?.data || [];
      const storeStatistics = statisticsResponse?.data || {};

      const totalOrders = orders.length;
      const completedOrders = orders.filter(
        (order) => order.state?.state === 'completed'
      ).length;
      const cancelledOrders = orders.filter(
        (order) => order.state?.state === 'cancelled'
      ).length;
      const totalRevenue = orders
        .filter((order) => order.state?.state === 'completed')
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

      let productsSold = 0;
      orders.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          productsSold += order.items.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          );
        }
      });

      const storeViewsCount = storeStatistics.storeViewsCount || 0;

      const ordersByDate = {};
      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        const dateKey = orderDate.toISOString().split('T')[0];

        if (!ordersByDate[dateKey]) {
          ordersByDate[dateKey] = {
            date: dateKey,
            completed: 0,
            cancelled: 0,
            total: 0,
          };
        }

        ordersByDate[dateKey].total += 1;
        if (order.state?.state === 'completed') {
          ordersByDate[dateKey].completed += 1;
        } else if (order.state?.state === 'cancelled') {
          ordersByDate[dateKey].cancelled += 1;
        }
      });

      const areaChartData = Object.values(ordersByDate)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((item) => ({
          date: item.date,
          completed: item.completed,
          cancelled: item.cancelled,
          total: item.total,
        }));

      const orderLocations = orders
        .filter(
          (order) =>
            order.addressLocation &&
            order.addressLocation.latitude &&
            order.addressLocation.longitude
        )
        .map((order) => ({
          _id: order._id,
          addressLocation: order.addressLocation,
          addressName: order.addressName || 'Noma\'lum',
        }));

      setStatistics({
        totalOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
        productsSold,
        storeViewsCount,
        areaChartData,
        orderLocations,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Statistikani yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setSearchParams({
        dateFrom: dateRange.from.toISOString(),
        dateTo: dateRange.to.toISOString(),
      });
    } else {
      const newParams = { ...searchParams };
      delete newParams.dateFrom;
      delete newParams.dateTo;
      setSearchParams(newParams);
    }
  }, [dateRange]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  return (
    <div className="space-y-4 py-2 sm:py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Welcome back, {storeName || 'Dashboard'}</h1>
        <DateRangePicker
          date={dateRange}
          onDateChange={handleDateRangeChange}
        />
      </div>

      <div className="grid grid-cols-2 min-[1200px]:grid-cols-3 border border-border rounded-xl bg-gradient-to-br from-sidebar/60 to-sidebar overflow-hidden">
        <div
          className="relative flex items-center gap-4 group p-4 lg:p-5 border-r border-b border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/dashboard/orders')}
        >
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Umumiy Buyurtmalar
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-primary">
              {loading ? '...' : statistics.totalOrders}
            </h3>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>

        <div
          className="relative flex items-center gap-4 group p-4 lg:p-5 border-r border-b border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/dashboard/orders?status=cancelled')}
        >
          <div className="bg-destructive/10 rounded-full p-2 border border-destructive/20">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Bekor qilingan
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-destructive">
              {loading ? '...' : statistics.cancelledOrders}
            </h3>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-destructive" />
        </div>

        <div
          className="relative flex items-center gap-4 group p-4 lg:p-5 border-r border-b border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/dashboard/orders?status=completed')}
        >
          <div className="bg-green-500/10 rounded-full p-2 border border-green-500/20">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Bajarilgan
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-green-500">
              {loading ? '...' : statistics.completedOrders}
            </h3>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-green-500" />
        </div>

        <div
          className="relative flex items-center gap-4 group p-4 lg:p-5 border-b border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/dashboard/finance')}
        >
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Umumiy kirim
            </p>
            <h3 className="text-xl font-semibold mb-1 text-primary">
              {loading ? '...' : formatNumber(statistics.totalRevenue)} so'm
            </h3>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>

        <div
          className="relative flex items-center gap-4 group p-4 lg:p-5 border-r border-b border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/dashboard/products')}
        >
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Sotilgan mahsulotlar
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-primary">
              {loading ? '...' : statistics.productsSold}
            </h3>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>

        <div
          className="relative flex items-center gap-4 group p-4 lg:p-5 border-b border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer"
        >
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <Eye className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Sahifa ko'rildi
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-primary">
              {loading ? '...' : statistics.storeViewsCount}
            </h3>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Buyurtmalar statistikasi
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Holat bo'yicha buyurtmalar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] sm:h-[400px] w-full">
              <AreaChart data={statistics.areaChartData}>
                <defs>
                  <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="#22c55e"
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="95%"
                      stopColor="#22c55e"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                  <linearGradient id="fillCancelled" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="#ef4444"
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="95%"
                      stopColor="#ef4444"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                  <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="#3b82f6"
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="95%"
                      stopColor="#3b82f6"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('uz-UZ', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString('uz-UZ', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="completed"
                  type="natural"
                  fill="url(#fillCompleted)"
                  stroke="#22c55e"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="cancelled"
                  type="natural"
                  fill="url(#fillCancelled)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="total"
                  type="natural"
                  fill="url(#fillTotal)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Zakazlar bo'yicha hududlar statistikasi
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Xaritada buyurtmalar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardMap
              height="400px"
              orderLocations={statistics.orderLocations}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
