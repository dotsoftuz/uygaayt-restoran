import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

function LowStockSettings({ open, onOpenChange, threshold, onSave }) {
  const [localThreshold, setLocalThreshold] = useState(threshold || 10);
  const [enabled, setEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalThreshold(threshold || 10);
      setEnabled(true);
    }
  }, [open, threshold]);

  const handleSave = async () => {
    if (localThreshold < 0) {
      toast.error('Chegara 0 dan kichik bo\'lishi mumkin emas');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        threshold: localThreshold,
        enabled,
      });
      toast.success('Sozlamalar saqlandi');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Sozlamalarni saqlashda xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Past ombordagi miqdor ogohlantirishlari</DialogTitle>
          <DialogDescription>
            Ombordagi miqdor past bo'lganda ogohlantirishlar sozlamalarini boshqaring
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Ogohlantirishlarni yoqish</Label>
              <p className="text-sm text-muted-foreground">
                Ombordagi miqdor past bo'lganda avtomatik ogohlantirishlar
              </p>
            </div>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="threshold">Chegara (dona)</Label>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  value={localThreshold}
                  onChange={(e) => setLocalThreshold(parseInt(e.target.value) || 0)}
                />
                <p className="text-sm text-muted-foreground">
                  Ombordagi miqdor bu qiymatdan past bo'lganda ogohlantirish ko'rsatiladi
                </p>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Misol:</strong> Agar chegara 10 bo'lsa, ombordagi miqdor 10 donadan
                  kam bo'lganda ogohlantirish ko'rsatiladi.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Bekor qilish
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LowStockSettings;

