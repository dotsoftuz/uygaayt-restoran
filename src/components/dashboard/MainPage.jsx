import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumber, formatDate } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock data generator
const generateFakeOrders = () => {
  const statuses = ['pending', 'accepted', 'preparing', 'ready', 'delivered'];
  const names = [
    'Ali Valiyev',
    'Dilshoda Karimova',
    'Javohir Toshmatov',
    'Malika Yusupova',
    'Sardor Rahimov',
  ];

  return names.map((name, index) => ({
    id: `ORD-${String(index + 1).padStart(6, '0')}`,
    clientName: name,
    amount: Math.floor(Math.random() * 500000) + 50000,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(Date.now() - index * 60 * 60 * 1000),
  }));
};

const generateChartData = (days) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayName = date.toLocaleDateString('uz-UZ', { weekday: 'short' });
    
    data.push({
      name: dayName,
      orders: Math.floor(Math.random() * 50) + 20,
      revenue: Math.floor(Math.random() * 5000000) + 2000000,
    });
  }
  
  return data;
};

function AdminDashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [chartPeriod, setChartPeriod] = useState('7');

  // Mock orders data
  const allOrders = useMemo(() => generateFakeOrders(), []);
  const last5Orders = useMemo(() => allOrders.slice(0, 5), [allOrders]);

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = allOrders.filter(
      (order) => new Date(order.createdAt) >= today
    );
    
    const newOrders = allOrders.filter(
      (order) => order.status === 'pending' || order.status === 'accepted'
    );
    
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.amount, 0);
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.amount, 0);
    const averageOrderValue = allOrders.length > 0 
      ? Math.round(totalRevenue / allOrders.length) 
      : 0;

    return {
      todayOrders: todayOrders.length,
      todayRevenue,
      newOrders: newOrders.length,
      averageOrderValue,
    };
  }, [allOrders]);

  const chartData = useMemo(() => {
    return generateChartData(Number(chartPeriod));
  }, [chartPeriod]);

  const getStatusBadge = (status) => {
    const configs = {
      pending: { label: 'Kutilmoqda', variant: 'secondary' },
      accepted: { label: 'Qabul qilindi', variant: 'default' },
      preparing: { label: 'Tayyorlanmoqda', variant: 'default' },
      ready: { label: 'Tayyor', variant: 'default' },
      delivered: { label: 'Yetkazilgan', variant: 'default' },
    };

    const config = configs[status] || configs.pending;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const handleOrderClick = (orderId) => {
    navigate(`/dashboard/order-detail/${orderId}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 min-[1200px]:grid-cols-4 border border-border rounded-xl bg-gradient-to-br from-sidebar/60 to-sidebar overflow-hidden">
        {/* Bugungi buyurtmalar */}
        <div 
          className="relative flex items-center gap-4 group p-4 lg:p-5 border-r border-b border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/dashboard/orders')}
        >
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Bugungi buyurtmalar
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-primary">
              {stats.todayOrders} ta
            </h3>
            <p className="text-xs text-muted-foreground/60">
              Umumiy buyurtmalar
            </p>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>

        {/* Bugungi daromad */}
        <div 
          className="relative flex items-center gap-4 group p-4 lg:p-5 border-r border-b border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/dashboard/finance')}
        >
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Bugungi daromad
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-primary">
              {formatNumber(stats.todayRevenue)} so'm
            </h3>
            <p className="text-xs text-muted-foreground/60">
              Karta + naqd + bonus
            </p>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>

        {/* Yangi buyurtmalar */}
        <div 
          className="relative flex items-center gap-4 group p-4 lg:p-5 border-r border-b border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/dashboard/orders?status=pending')}
        >
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <AlertCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Yangi buyurtmalar
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-primary">
              {stats.newOrders} ta
            </h3>
            <p className="text-xs text-muted-foreground/60">
              Ochilmagan buyurtmalar
            </p>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>

        {/* O'rtacha buyurtma qiymati */}
        <div className="relative flex items-center gap-4 group p-4 lg:p-5 border-b border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer">
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              O'rtacha buyurtma
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-primary">
              {formatNumber(stats.averageOrderValue)} so'm
            </h3>
            <p className="text-xs text-muted-foreground/60">
              O'rtacha qiymat
            </p>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* So'nggi 5 buyurtma */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">So'nggi buyurtmalar</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Eng so'nggi 5 ta buyurtma
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard/orders')}
                className="text-xs sm:text-sm"
              >
                Barchasi
                <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isMobile ? (
              <div className="space-y-2 p-4">
                {last5Orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => handleOrderClick(order.id)}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{order.clientName}</p>
                      <p className="text-xs text-muted-foreground">{order.id}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-sm font-semibold">
                        {formatNumber(order.amount)} so'm
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">ID</TableHead>
                    <TableHead>Mijoz</TableHead>
                    <TableHead className="text-right">Summa</TableHead>
                    <TableHead className="w-[140px]">Holat</TableHead>
                    <TableHead className="w-[120px] text-right">Vaqt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {last5Orders.map((order) => (
                    <TableRow
                      key={order.id}
                      onClick={() => handleOrderClick(order.id)}
                      className="cursor-pointer hover:bg-accent"
                    >
                      <TableCell className="font-mono text-xs sm:text-sm">
                        {order.id}
                      </TableCell>
                      <TableCell className="font-medium text-sm sm:text-base">
                        {order.clientName}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm sm:text-base">
                        {formatNumber(order.amount)} so'm
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right text-xs sm:text-sm text-muted-foreground">
                        {formatDate(order.createdAt.getTime())}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Tezkor amallar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Tezkor amallar</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Tez kirish tugmalari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full justify-start"
              onClick={() => navigate('/dashboard/products')}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Mahsulot qo'shish</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/dashboard/orders')}
            >
              <Eye className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Buyurtmalarni ko'rish</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/dashboard/finance')}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Payout so'rov</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Grafik: Buyurtma va daromad */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base sm:text-lg">Buyurtma va daromad</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Haftalik/oylik statistika
              </CardDescription>
            </div>
            <Tabs value={chartPeriod} onValueChange={setChartPeriod} className="w-full sm:w-auto">
              <TabsList className="grid w-full sm:w-auto grid-cols-3">
                <TabsTrigger value="7" className="text-xs sm:text-sm">7 kun</TabsTrigger>
                <TabsTrigger value="30" className="text-xs sm:text-sm">30 kun</TabsTrigger>
                <TabsTrigger value="90" className="text-xs sm:text-sm">90 kun</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px] sm:h-[400px]">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 20, bottom: 0, left: -10 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                label={{ value: 'Buyurtmalar', angle: -90, position: 'insideLeft' }}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                label={{ value: 'Daromad', angle: 90, position: 'insideRight' }}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="orders"
                name="Buyurtmalar"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                name="Daromad"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ r: 4, fill: 'hsl(var(--chart-2))' }}
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboard;
