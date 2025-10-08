import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/AppContext';
import {
  Phone,
  User,
  ArrowLeft,
  Calendar,
  Briefcase,
  Users,
  ClockArrowDown,
  HandCoins,
  MapPin,
  CircleOff,
  ArrowUpRightIcon,
  Wallet,
  Star,
  BriefcaseBusiness,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

export default function EmployeeDetails() {
  // https://crafted.is/exp1 statistics
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { employees } = useAppContext();

  const employee = employees.find((e) => e.id === employeeId);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(
      date.seconds ? date.seconds * 1000 : date
    ).toLocaleDateString('uz-UZ');
  };

  const getPositionLabel = (position) => {
    const positions = {
      video_operator: 'Video operator',
      photograph: 'Fotograf',
      editor: 'Editor',
    };
    return positions[position] || position;
  };

  const getTypeLabel = (type) => {
    const types = {
      studio: 'Studio ishchi',
      freelance: 'Yollanma ishchi',
    };
    return types[type] || type;
  };

  const getTypeVariant = (type) => {
    return type === 'studio' ? 'default' : 'secondary';
  };

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Xodim topilmadi</h2>
          <p className="text-muted-foreground mb-4">
            Bu xodim mavjud emas yoki o'chirilgan
          </p>
          <Button onClick={() => navigate('/dashboard/employees')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Xodimlar ro'yxatiga qaytish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-2">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-3">
          <span>{employee.name}</span>
          <Badge
            className={cn(
              'text-xs font-medium border-none dark:text-white',
              employee.position === 'editor' &&
                'bg-blue-100 hover:bg-blue-200/80 text-blue-500 dark:bg-blue-500',
              employee.position === 'photographer' &&
                'bg-green-100 hover:bg-green-200/80 text-green-500 dark:bg-green-500',
              employee.position === 'video_operator' &&
                'bg-amber-100 hover:bg-amber-200/80 text-amber-500 dark:bg-amber-500'
            )}
          >
            {getPositionLabel(employee.position)}
          </Badge>
        </h1>
        <div className="mt-2 lg:mt-3 flex flex-wrap items-center  gap-3 lg:gap-5">
          <Badge
            variant={getTypeVariant(employee.type)}
            className="flex items-center gap-2 text-sm pr-3"
          >
            <User className="h-4 w-4 text-muted-foreground" />
            {getTypeLabel(employee.type)}
          </Badge>
          <div variant="secondary" className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{employee.phone}</span>
          </div>
          <div variant="secondary" className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formatDate(employee.createdAt)}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Employee Statistics */}
      <div className="grid grid-cols-2 min-[1200px]:grid-cols-4 border border-border rounded-xl bg-gradient-to-br from-sidebar/60 to-sidebar">
        {/* Jami buyurtmalar */}
        <div className="flex items-center gap-4 relative p-4 lg:p-5 group before:absolute before:inset-y-8 before:right-0 before:w-px before:bg-gradient-to-b before:from-input/30 before:via-input before:to-input/30 last:before:hidden">
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <HandCoins className="h-6 w-6 text-primary" />
          </div>
          <div>
            <span className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Jami buyurtmalar
            </span>
            <h3 className="text-2xl font-semibold mb-2 text-primary">34 ta</h3>
            <div className="text-xs text-muted-foreground/60">
              <span className="font-medium text-emerald-500">+12%</span> o‘tgan
              oyga nisbatan
            </div>
          </div>
        </div>

        {/* Oylik daromad */}
        <div className="flex items-center gap-4 relative p-4 lg:p-5 group before:absolute before:inset-y-8 before:right-0 before:w-px before:bg-gradient-to-b before:from-input/30 before:via-input before:to-input/30 last:before:hidden">
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <span className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Oylik daromad
            </span>
            <h3 className="text-2xl font-semibold mb-2 text-primary">
              12.4 mln so‘m
            </h3>
            <div className="text-xs text-muted-foreground/60">
              <span className="font-medium text-emerald-500">+8%</span> o‘tgan
              oyga nisbatan
            </div>
          </div>
        </div>

        {/* Mijozlardan o‘rtacha baho */}
        <div className="flex items-center gap-4 relative p-4 lg:p-5 group before:absolute before:inset-y-8 before:right-0 before:w-px before:bg-gradient-to-b before:from-input/30 before:via-input before:to-input/30 last:before:hidden">
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <div>
            <span className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              O‘rtacha baho
            </span>
            <h3 className="text-2xl font-semibold mb-2 text-primary">
              4.8 / 5
            </h3>
            <div className="text-xs text-muted-foreground/60">
              <span className="font-medium text-emerald-500">+0.3</span> o‘tgan
              oyga nisbatan
            </div>
          </div>
        </div>

        {/* Faol loyihalar */}
        <div className="flex items-center gap-4 relative p-4 lg:p-5 group">
          <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
            <BriefcaseBusiness className="h-6 w-6 text-primary" />
          </div>
          <div>
            <span className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60">
              Faol loyihalar
            </span>
            <h3 className="text-2xl font-semibold mb-2 text-primary">5 ta</h3>
            <div className="text-xs text-muted-foreground/60">
              <span className="font-medium text-emerald-500">2 ta yangi</span>{' '}
              bu oyda
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="text-center py-8 lg:py-12 border rounded-lg">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleOff />
            </EmptyMedia>
            <EmptyTitle>Harakatlar topilmadi</EmptyTitle>
            <EmptyDescription>
              Hech qanday harakat mavjud emas, buning uchun hodimga ish
              biriktiring.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link to="/dashboard/employees">
              <Button size="sm">Ortga qaytish</Button>
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
