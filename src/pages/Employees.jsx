import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AddEmployee from '@/components/dashboard/dialogs/AddEmployee';
import { useAppContext } from '@/context/AppContext';
import { useDebounce } from '@/hooks/use-debounce';
import { Plus, Search, Phone, User, Calendar, CircleOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import CustomPagination from '@/components/ui/custom-pagination';

function Employees() {
  const { employees } = useAppContext();
  const navigate = useNavigate();

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPosition, setFilterPosition] = useState('all');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredEmployees = employees.filter((employee) => {
    const search = debouncedSearch.toLowerCase();
    const matchesSearch =
      employee.name.toLowerCase().includes(search) ||
      employee.phone.includes(search);

    const matchesType = filterType === 'all' || employee.type === filterType;
    const matchesPosition =
      filterPosition === 'all' || employee.position === filterPosition;

    return matchesSearch && matchesType && matchesPosition;
  });

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

  const handleEmployeeClick = (employee) => {
    navigate(`/dashboard/employees/${employee.id}`);
  };

  return (
    <div className="space-y-4 my-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Xodimlar ro'yxati
          </h2>
          <p className="text-muted-foreground">
            Tizimga yangi xodim qo'shish uchun "Xodim qo'shish" tugmasini
            bosing.
          </p>
        </div>
        <Button
          onClick={() => setShowAddEmployee(true)}
          className="flex items-center gap-2"
        >
          Xodim qo'shish
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Xodimlarni qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Ishchi turi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha turlar</SelectItem>
            <SelectItem value="studio">Studio ishchi</SelectItem>
            <SelectItem value="freelance">Yollanma ishchi</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPosition} onValueChange={setFilterPosition}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Vazifa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha vazifalar</SelectItem>
            <SelectItem value="video_operator">Video operator</SelectItem>
            <SelectItem value="photograph">Fotograf</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employees Table */}
      <div className="space-y-4">
        <div className="bg-background overflow-hidden rounded-md border [&>div]:max-h-96">
          {filteredEmployees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r bg-muted">
                  <TableHead className="w-10 text-center">№</TableHead>
                  <TableHead className="py-2 font-medium w-[18rem]">
                    Ism
                  </TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Vazifa</TableHead>
                  <TableHead>Ishchi turi</TableHead>
                  <TableHead>Qo'shilgan sana</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee, index) => (
                  <TableRow
                    key={employee.id}
                    className="cursor-pointer *:border-border hover:bg-muted/50 [&>:not(:last-child)]:border-r"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="py-2 font-medium max-w-[18rem]">
                      <span className="truncate block max-w-[18rem]">
                        {employee.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {employee.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-medium border-none dark:text-white',
                          employee.position === 'editor' &&
                            'bg-blue-100 text-blue-500 dark:bg-blue-500',
                          employee.position === 'photographer' &&
                            'bg-green-100 text-green-500 dark:bg-green-500',
                          employee.position === 'video_operator' &&
                            'bg-amber-100 text-amber-500 dark:bg-amber-500'
                        )}
                      >
                        {getPositionLabel(employee.position)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeVariant(employee.type)}>
                        {getTypeLabel(employee.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(employee.createdAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 lg:py-12 border rounded-lg">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CircleOff />
                  </EmptyMedia>
                  <EmptyTitle>Hali xodimlar mavjud emas!</EmptyTitle>
                  <EmptyDescription>
                    Tizimga yangi xodim qo'shish uchun "Xodim qo'shish"
                    tugmasini bosing.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={() => setShowAddEmployee(true)} size="sm">
                    Xodim qo'shish
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          )}
        </div>

        <CustomPagination />
      </div>

      {/* Add Employee Dialog */}
      <AddEmployee open={showAddEmployee} onOpenChange={setShowAddEmployee} />
    </div>
  );
}

export default Employees;
