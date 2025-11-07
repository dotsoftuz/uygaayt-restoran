import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, MoreVertical, Trash2, Edit, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock staff data
const generateFakeStaff = () => {
  return [
    {
      id: 'staff-1',
      name: 'Ali Valiyev',
      email: 'ali@example.com',
      phone: '+998901234567',
      role: 'storeStaff',
      permissions: ['orders', 'products'],
      status: 'active',
    },
    {
      id: 'staff-2',
      name: 'Dilshoda Karimova',
      email: 'dilshoda@example.com',
      phone: '+998901234568',
      role: 'storeStaff',
      permissions: ['orders'],
      status: 'active',
    },
  ];
};

const ROLES = [
  { value: 'storeStaff', label: 'Do\'kon xodimi' },
  { value: 'manager', label: 'Menejer' },
  { value: 'admin', label: 'Administrator' },
];

const PERMISSIONS = [
  { value: 'orders', label: 'Buyurtmalar' },
  { value: 'products', label: 'Mahsulotlar' },
  { value: 'finance', label: 'Moliya' },
  { value: 'settings', label: 'Sozlamalar' },
];

function TeamManagement() {
  const isMobile = useIsMobile();
  const [staff, setStaff] = useState(generateFakeStaff());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'storeStaff',
    permissions: [],
  });

  const handleAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'storeStaff',
      permissions: [],
    });
    setSelectedStaff(null);
    setAddDialogOpen(true);
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      permissions: member.permissions || [],
    });
    setSelectedStaff(member);
    setEditDialogOpen(true);
  };

  const handleDelete = (member) => {
    setSelectedStaff(member);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (selectedStaff) {
        // Update existing
        setStaff((prev) =>
          prev.map((s) =>
            s.id === selectedStaff.id
              ? {
                  ...s,
                  ...formData,
                }
              : s
          )
        );
        toast.success('Xodim yangilandi');
      } else {
        // Add new
        const newStaff = {
          id: `staff-${Date.now()}`,
          ...formData,
          status: 'active',
        };
        setStaff((prev) => [...prev, newStaff]);
        toast.success('Xodim qo\'shildi');
      }

      setAddDialogOpen(false);
      setEditDialogOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'storeStaff',
        permissions: [],
      });
      setSelectedStaff(null);
    } catch (error) {
      console.error('Error saving staff:', error);
      toast.error('Ma\'lumotlarni saqlashda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedStaff) {
      setStaff((prev) => prev.filter((s) => s.id !== selectedStaff.id));
      toast.success('Xodim o\'chirildi');
    }
    setDeleteDialogOpen(false);
    setSelectedStaff(null);
  };

  const handlePermissionToggle = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">Jamoa a'zolari</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Do'kon xodimlarini boshqaring
          </p>
        </div>
        <Button onClick={handleAdd} size="sm" className="h-9 sm:h-10">
          <UserPlus className="w-4 h-4" />
          <span className="text-xs sm:text-sm">Xodim qo'shish</span>
        </Button>
      </div>

      {staff.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Ism</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Telefon</TableHead>
                <TableHead className="hidden lg:table-cell">Rol</TableHead>
                <TableHead className="hidden md:table-cell">Ruxsatlar</TableHead>
                <TableHead className="text-right">Amal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="font-medium text-sm sm:text-base">{member.name}</div>
                    <div className="text-xs text-muted-foreground sm:hidden">
                      {member.email}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    {member.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {member.phone}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {ROLES.find((r) => r.value === member.role)?.label || member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {member.permissions?.slice(0, 2).map((perm) => (
                        <Badge key={perm} variant="secondary" className="text-xs">
                          {PERMISSIONS.find((p) => p.value === perm)?.label || perm}
                        </Badge>
                      ))}
                      {member.permissions?.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{member.permissions.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {isMobile ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(member)}>
                            <Edit className="h-4 w-4" />
                            Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(member)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            O'chirish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(member)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(member)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Hech qanday xodim qo'shilmagan</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={addDialogOpen || editDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          setEditDialogOpen(open);
          if (!open) {
            setFormData({
              name: '',
              email: '',
              phone: '',
              role: 'storeStaff',
              permissions: [],
            });
            setSelectedStaff(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedStaff ? 'Xodimni tahrirlash' : 'Yangi xodim qo\'shish'}
            </DialogTitle>
            <DialogDescription>
              Xodim ma'lumotlarini kiriting va ruxsatlarni belgilang
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label required className="text-xs sm:text-sm">Ism</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ism familiya"
                className="text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label required className="text-xs sm:text-sm">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label required className="text-xs sm:text-sm">Telefon</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+998901234567"
                className="text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label required className="text-xs sm:text-sm">Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Ruxsatlar</Label>
              <div className="space-y-2 border rounded-lg p-3">
                {PERMISSIONS.map((permission) => (
                  <div
                    key={permission.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={permission.value}
                      checked={formData.permissions.includes(permission.value)}
                      onCheckedChange={() => handlePermissionToggle(permission.value)}
                    />
                    <Label
                      htmlFor={permission.value}
                      className="text-xs sm:text-sm font-normal cursor-pointer"
                    >
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false);
                setEditDialogOpen(false);
              }}
              className="w-full sm:w-auto"
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting || !formData.name || !formData.email || !formData.phone}
              className="w-full sm:w-auto"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedStaff ? 'Yangilash' : 'Qo\'shish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xodimni o'chirish</DialogTitle>
            <DialogDescription>
              Bu xodimni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedStaff && (
              <p className="text-sm text-muted-foreground">
                <strong>{selectedStaff.name}</strong> xodimi butunlay o'chiriladi.
              </p>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TeamManagement;

