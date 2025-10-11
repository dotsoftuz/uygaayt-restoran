import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  CircleOff,
  Tag,
  Loader2,
} from 'lucide-react';
import { useServices } from '@/hooks/use-services';
import { toast } from 'sonner';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import CustomPagination from '@/components/ui/custom-pagination';

function Services() {
  const { services, loading, error, addService, updateService, deleteService } =
    useServices();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({
    name: '',
    price: '',
    status: 'active',
    category: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddService = async () => {
    if (newService.name && newService.price && newService.category) {
      setIsSubmitting(true);
      try {
        const serviceData = {
          ...newService,
          price: parseInt(newService.price),
          quantity: 0,
          date: '',
          isWorking: [],
          comment: '',
        };
        await addService(serviceData);
        setNewService({
          name: '',
          price: '',
          status: 'active',
          category: '',
          quantity: 0,
          date: '',
          isWorking: [],
          comment: '',
        });
        setIsAddDialogOpen(false);
        toast.success("Xizmat muvaffaqiyatli qo'shildi");
      } catch (error) {
        console.error('Error adding service:', error);
        toast.error("Xizmat qo'shishda xatolik yuz berdi");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setIsEditDialogOpen(true);
  };

  const handleUpdateService = async () => {
    if (editingService) {
      setIsSubmitting(true);
      try {
        await updateService(editingService.id, editingService);
        setIsEditDialogOpen(false);
        setEditingService(null);
        toast.success('Xizmat muvaffaqiyatli yangilandi');
      } catch (error) {
        console.error('Error updating service:', error);
        toast.error('Xizmat yangilashda xatolik yuz berdi');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteService = (service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteService = async () => {
    if (serviceToDelete) {
      try {
        await deleteService(serviceToDelete.id);
        toast.success("Xizmat muvaffaqiyatli o'chirildi");
        setIsDeleteDialogOpen(false);
        setServiceToDelete(null);
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error("Xizmat o'chirishda xatolik yuz berdi");
      }
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-500' : 'bg-gray-500';
  };

  const getStatusText = (status) => {
    return status === 'active' ? 'Faol' : 'Nofaol';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Yuklanmoqda...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Xatolik: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-2">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Xizmatlar ro'yxati
          </h2>
          <p className="text-muted-foreground">
            Tizimga yangi xizmat qo'shish uchun "Xizmat qo'shish" tugmasini
            bosing.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" size="sm">
              Xizmat qo'shish
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yangi xizmat qo'shish</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Xizmat nomi</Label>
                <Input
                  id="name"
                  value={newService.name}
                  onChange={(e) =>
                    setNewService({ ...newService, name: e.target.value })
                  }
                  placeholder="Xizmat nomini kiriting"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Narx (so'm)</Label>
                <Input
                  id="price"
                  type="number"
                  value={newService.price}
                  onChange={(e) =>
                    setNewService({ ...newService, price: e.target.value })
                  }
                  placeholder="Narxni kiriting"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategoriya</Label>
                <Select
                  value={newService.category}
                  onValueChange={(value) =>
                    setNewService({ ...newService, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategoriyani tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Foto">Foto</SelectItem>
                    <SelectItem value="Albom">Albom</SelectItem>
                    <SelectItem value="Taklifnoma">Taklifnoma</SelectItem>
                    <SelectItem value="Kamera">Kamera</SelectItem>
                    <SelectItem value="Boshqa">Boshqa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Holat</Label>
                <Select
                  value={newService.status}
                  onValueChange={(value) =>
                    setNewService({ ...newService, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Faol</SelectItem>
                    <SelectItem value="inactive">Nofaol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
              >
                Bekor qilish
              </Button>
              <Button onClick={handleAddService} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Qo'shilmoqda...
                  </>
                ) : (
                  "Qo'shish"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Xizmatlarni qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Services Table */}
      <div className="space-y-4">
        <div className="bg-background overflow-hidden rounded-md border [&>div]:max-h-[30rem]">
          {filteredServices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r bg-muted/50">
                  <TableHead className="w-10 text-center">№</TableHead>
                  <TableHead className="font-medium">Xizmat nomi</TableHead>
                  <TableHead>Kategoriya</TableHead>
                  <TableHead>Narx</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead>Amallar</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredServices.map((service, index) => (
                  <TableRow
                    key={service.id}
                    className="*:border-border [&>:not(:last-child)]:border-r hover:bg-transparent"
                  >
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell className="font-medium max-w-[18rem]">
                      <span className="truncate block max-w-[18rem]">
                        {service.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-medium">
                        {service.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">
                          {service.price.toLocaleString('uz-UZ')} so‘m
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'text-white font-medium border-none',
                          service.status === 'active' &&
                            'bg-green-500 hover:bg-green-600',
                          service.status === 'inactive' &&
                            'bg-gray-400 hover:bg-gray-500',
                          service.status === 'pending' &&
                            'bg-red-500 hover:bg-red-600'
                        )}
                      >
                        {getStatusText(service.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteService(service)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" color="red" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 lg:py-12 border rounded-lg bg-muted/50">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CircleOff />
                  </EmptyMedia>
                  <EmptyTitle>Hali xizmatlar mavjud emas!</EmptyTitle>
                  <EmptyDescription>
                    Yangi xizmat qo‘shish uchun "Xizmat qo‘shish" tugmasini
                    bosing.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button size="sm">Xizmat qo‘shish</Button>
                </EmptyContent>
              </Empty>
            </div>
          )}
        </div>
        <CustomPagination />
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xizmatni tahrirlash</DialogTitle>
          </DialogHeader>
          {editingService && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Xizmat nomi</Label>
                <Input
                  id="edit-name"
                  value={editingService.name}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Narx (so'm)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editingService.price}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      price: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Kategoriya</Label>
                <Select
                  value={editingService.category}
                  onValueChange={(value) =>
                    setEditingService({ ...editingService, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        editingService.category || 'Kategoriyani tanlang'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Foto">Foto</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Albom">Albom</SelectItem>
                    <SelectItem value="Taklifnoma">Taklifnoma</SelectItem>
                    <SelectItem value="Kamera">Kamera</SelectItem>
                    <SelectItem value="Boshqa">Boshqa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Holat</Label>
                <Select
                  value={editingService.status}
                  onValueChange={(value) =>
                    setEditingService({ ...editingService, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        editingService.status === 'active' ? 'Faol' : 'Nofaol'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Faol</SelectItem>
                    <SelectItem value="inactive">Nofaol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Bekor qilish
            </Button>
            <Button onClick={handleUpdateService} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saqlanmoqda...
                </>
              ) : (
                'Saqlash'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xizmatni o'chirish</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              <strong>{serviceToDelete?.name}</strong> xizmatini o'chirishni
              xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setServiceToDelete(null);
              }}
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteService}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  O'chirilmoqda...
                </>
              ) : (
                "O'chirish"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Services;
