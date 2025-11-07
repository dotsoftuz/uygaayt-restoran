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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Trash2, Copy, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock API keys data
const generateFakeAPIKeys = () => {
  return [
    {
      id: 'key-1',
      name: 'POS Integration',
      key: 'sk_live_51H...',
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'active',
    },
    {
      id: 'key-2',
      name: 'Mobile App',
      key: 'sk_test_42K...',
      lastUsed: null,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'active',
    },
  ];
};

function APIKeys() {
  const isMobile = useIsMobile();
  const [apiKeys, setApiKeys] = useState(generateFakeAPIKeys());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  const [newKeyName, setNewKeyName] = useState('');

  const handleAdd = () => {
    setNewKeyName('');
    setAddDialogOpen(true);
  };

  const handleSave = async () => {
    if (!newKeyName.trim()) {
      toast.error('API kalit nomini kiriting');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newKey = {
        id: `key-${Date.now()}`,
        name: newKeyName,
        key: `sk_live_${Math.random().toString(36).substring(2, 15)}...`,
        fullKey: `sk_live_${Math.random().toString(36).substring(2, 30)}`,
        lastUsed: null,
        createdAt: new Date(),
        status: 'active',
      };

      setApiKeys((prev) => [...prev, newKey]);
      toast.success('API kalit yaratildi');
      setAddDialogOpen(false);
      setNewKeyName('');

      // Show full key once
      toast.info(`Yangi API kalit: ${newKey.fullKey}`, {
        duration: 10000,
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('API kalit yaratishda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (key) => {
    setSelectedKey(key);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedKey) {
      setApiKeys((prev) => prev.filter((k) => k.id !== selectedKey.id));
      toast.success('API kalit o\'chirildi');
    }
    setDeleteDialogOpen(false);
    setSelectedKey(null);
  };

  const handleCopy = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('API kalit nusxalandi');
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const formatDate = (date) => {
    if (!date) return 'Hech qachon';
    return new Date(date).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">API kalitlar</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            POS integratsiyasi va boshqa xizmatlar uchun API kalitlarini boshqaring
          </p>
        </div>
        <Button onClick={handleAdd} size="sm" className="h-9 sm:h-10">
          <Plus className="w-4 h-4" />
          <span className="text-xs sm:text-sm">Yangi kalit</span>
        </Button>
      </div>

      {apiKeys.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomi</TableHead>
                <TableHead className="hidden sm:table-cell">API kalit</TableHead>
                <TableHead className="hidden md:table-cell">Yaratilgan</TableHead>
                <TableHead className="hidden lg:table-cell">Oxirgi ishlatilgan</TableHead>
                <TableHead className="text-right">Amal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell>
                    <div className="font-medium text-sm sm:text-base">{apiKey.name}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <code className="text-xs sm:text-sm font-mono bg-muted px-2 py-1 rounded">
                        {visibleKeys.has(apiKey.id) && apiKey.fullKey
                          ? apiKey.fullKey
                          : apiKey.key}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {visibleKeys.has(apiKey.id) ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(apiKey.fullKey || apiKey.key)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                    {formatDate(apiKey.createdAt)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                    {formatDate(apiKey.lastUsed)}
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
                          <DropdownMenuItem
                            onClick={() => handleCopy(apiKey.fullKey || apiKey.key)}
                          >
                            <Copy className="h-4 w-4" />
                            Nusxalash
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(apiKey)}
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
                          onClick={() => handleCopy(apiKey.fullKey || apiKey.key)}
                          className="h-8 w-8"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(apiKey)}
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
          <KeyRound className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Hech qanday API kalit yaratilmagan</p>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Yangi API kalit yaratish</DialogTitle>
            <DialogDescription>
              POS integratsiyasi yoki boshqa xizmatlar uchun yangi API kalit yarating
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label required className="text-xs sm:text-sm">Kalit nomi</Label>
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Masalan: POS Integration"
                className="text-sm sm:text-base"
              />
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Ogohlantirish:</strong> API kalitni yaratgandan so'ng, to'liq kalitni
                ko'rsatamiz. Uni darhol nusxalab oling, chunki keyinroq to'liq kalitni ko'rish
                mumkin bo'lmaydi.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting || !newKeyName.trim()}
              className="w-full sm:w-auto"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yaratish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>API kalitni o'chirish</DialogTitle>
            <DialogDescription>
              Bu API kalitni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi va
              integratsiya ishlamay qolishi mumkin.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedKey && (
              <p className="text-sm text-muted-foreground">
                <strong>{selectedKey.name}</strong> API kaliti butunlay o'chiriladi.
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

export default APIKeys;

