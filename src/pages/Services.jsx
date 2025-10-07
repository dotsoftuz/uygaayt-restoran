import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Edit, Trash2, Search, Package, Loader2 } from 'lucide-react';
import { useServices } from '@/hooks/use-services';
import { toast } from 'sonner';

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
        };
        await addService(serviceData);
        setNewService({
          name: '',
          price: '',
          status: 'active',
          category: '',
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
    <div className="space-y-6 my-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Xizmatlar</h1>
          <p className="text-muted-foreground">Barcha xizmatlarni boshqaring</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Xizmatlar ro'yxati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Xizmat nomi</th>
                  <th className="text-left p-4 font-medium">Kategoriya</th>
                  <th className="text-left p-4 font-medium">Narx</th>
                  <th className="text-left p-4 font-medium">Holat</th>
                  <th className="text-left p-4 font-medium">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{service.name}</td>
                    <td className="p-4">
                      <Badge variant="outline">{service.category}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {service.price.toLocaleString('uz-UZ')} so'm
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        className={`${getStatusColor(service.status)} text-white`}
                      >
                        {getStatusText(service.status)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
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
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredServices.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Hech qanday xizmat topilmadi
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
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

      {/* Delete Confirmation Dialog */}
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
