import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import {
  Package,
  Store,
  Bike,
  Users,
  CreditCard,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { MonthPicker } from '@/components/ui/month-picker';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

function AdminDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { orders, clients, couriers, stores } = useAppContext();

  // Demo statistik ma'lumotlar (keyinchalik backenddan olinadi)
  const stats = useMemo(() => {
    return {
      todayOrders: 122,
      activeStores: 57,
      activeCouriers: 34,
      newUsers: 18,
      todayRevenue: 16250000,
      deliveredOrders: 109,
    };
  }, []);

  return (
    <div className="space-y-4 my-2">
      <div className="items-center justify-between hidden">
        <h2 className="hidden md:block text-xl font-bold tracking-tight">
          Hi, Welcome back 👋
        </h2>
        <MonthPicker
          className="md:w-44"
          month={selectedMonth}
          setMonth={setSelectedMonth}
        />
      </div>

      <div className="grid grid-cols-2 min-[1200px]:grid-cols-3 border border-border rounded-xl bg-gradient-to-br from-sidebar/60 to-sidebar overflow-hidden">
        {/* 📦 Bugungi buyurtmalar */}
        <div className="relative flex items-center gap-4 group p-4 lg:p-5 border-r border-b border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer">
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

        {/* 🏪 Faol do‘konlar */}
        <div className="relative flex items-center gap-4 group p-4 lg:p-5 border-r border-b border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer">
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Faol do‘konlar
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-primary">
              {stats.activeStores} ta
            </h3>
            <p className="text-xs text-muted-foreground/60">
              Bugun ishlayotganlar
            </p>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>

        {/* 🚚 Faol kuryerlar */}
        <div className="relative flex items-center gap-4 group p-4 lg:p-5 border-b border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer">
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <Bike className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Faol kuryerlar
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-primary">
              {stats.activeCouriers} ta
            </h3>
            <p className="text-xs text-muted-foreground/60">
              Onlayn yoki yetkazmoqda
            </p>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>

        {/* 👥 Yangi foydalanuvchilar */}
        <div className="relative flex items-center gap-4 group p-4 lg:p-5 border-r border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer">
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Yangi foydalanuvchilar
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-primary">
              {stats.newUsers} ta
            </h3>
            <p className="text-xs text-muted-foreground/60">
              Bugun ro‘yxatdan o‘tganlar
            </p>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>

        {/* 💳 Bugungi tushum */}
        <div className="relative flex items-center gap-4 group p-4 lg:p-5 border-r border-border/30 hover:bg-muted/40 transition-all duration-300 cursor-pointer">
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Bugungi tushum
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-primary">
              {stats.todayRevenue.toLocaleString()} so‘m
            </h3>
            <p className="text-xs text-muted-foreground/60">
              Karta + naqd + bonus
            </p>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>

        {/* ✅ Yetkazilgan buyurtmalar */}
        <div className="relative flex items-center gap-4 group p-4 lg:p-5 hover:bg-muted/40 transition-all duration-300 cursor-pointer">
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Yetkazilgan buyurtmalar
            </p>
            <h3 className="text-2xl font-semibold mb-1 text-primary">
              {stats.deliveredOrders} ta
            </h3>
            <p className="text-xs text-muted-foreground/60">
              Muvaffaqiyatli yakunlanganlar
            </p>
          </div>
          <ArrowRight className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6 -rotate-45 text-primary" />
        </div>
      </div>

      {/* 📈 Faollik va daromad */}
      <div className="mt-8 space-y-4 hidden">
        <Tabs defaultValue="day" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="day">Kunlik</TabsTrigger>
            <TabsTrigger value="week">Haftalik</TabsTrigger>
            <TabsTrigger value="month">Oylik</TabsTrigger>
          </TabsList>

          <TabsContent value="day" className="space-y-4">
            <Card className="pt-0">
              <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                  <CardTitle>Kunlik buyurtmalar faolligi</CardTitle>
                  <CardDescription>
                    Soatlik buyurtmalar soni asosida shakllangan real vaqt
                    tahlili
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={{}}>
                  <LineChart
                    data={[
                      { name: '08:00', orders: 12 },
                      { name: '10:00', orders: 30 },
                      { name: '12:00', orders: 55 },
                      { name: '14:00', orders: 70 },
                      { name: '16:00', orders: 40 },
                      { name: '18:00', orders: 65 },
                      { name: '20:00', orders: 50 },
                    ]}
                    margin={{ top: 10, right: 20, bottom: 0, left: -10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: 'var(--muted-foreground)' }}
                    />
                    <YAxis tick={{ fill: 'var(--muted-foreground)' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="week" className="space-y-4">
            <Card className="pt-0">
              <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                  <CardTitle>Daromad o‘zgarishi (haftalik)</CardTitle>
                  <CardDescription>
                    Kartadan va naqd tushumlardan iborat haftalik daromad
                    taqsimoti
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={{}} className="h-[300px]">
                  <BarChart
                    data={[
                      { name: 'Dushanba', card: 4500000, cash: 2000000 },
                      { name: 'Seshanba', card: 3800000, cash: 1800000 },
                      { name: 'Chorshanba', card: 5100000, cash: 2500000 },
                      { name: 'Payshanba', card: 4700000, cash: 2100000 },
                      { name: 'Juma', card: 6200000, cash: 3000000 },
                      { name: 'Shanba', card: 7000000, cash: 3200000 },
                      { name: 'Yakshanba', card: 4000000, cash: 1700000 },
                    ]}
                    margin={{ top: 10, right: 20, bottom: 0, left: -10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: 'var(--muted-foreground)' }}
                    />
                    <YAxis tick={{ fill: 'var(--muted-foreground)' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="card"
                      name="Karta to‘lovlari"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="cash"
                      name="Naqd tushum"
                      fill="hsl(var(--success))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="month" className="space-y-4">
            <Card className="pt-0">
              <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                  <CardTitle>Oylik umumiy tahlil</CardTitle>
                  <CardDescription>
                    So‘nggi 6 oy davomida oylik daromadning o‘sish dinamikasi
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={{}} className="h-[300px]">
                  <LineChart
                    data={[
                      { name: 'Yan', revenue: 32000000 },
                      { name: 'Fev', revenue: 28000000 },
                      { name: 'Mar', revenue: 41000000 },
                      { name: 'Apr', revenue: 38000000 },
                      { name: 'May', revenue: 50000000 },
                      { name: 'Iyun', revenue: 47000000 },
                    ]}
                    margin={{ top: 10, right: 20, bottom: 0, left: -10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: 'var(--muted-foreground)' }}
                    />
                    <YAxis tick={{ fill: 'var(--muted-foreground)' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={{ r: 4, fill: 'hsl(var(--chart-3))' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AdminDashboard;
