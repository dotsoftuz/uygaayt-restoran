import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = [
  { value: 'monday', label: 'Dushanba' },
  { value: 'tuesday', label: 'Seshanba' },
  { value: 'wednesday', label: 'Chorshanba' },
  { value: 'thursday', label: 'Payshanba' },
  { value: 'friday', label: 'Juma' },
  { value: 'saturday', label: 'Shanba' },
  { value: 'sunday', label: 'Yakshanba' },
];

const TIMEZONES = [
  { value: 'Asia/Tashkent', label: 'Asia/Tashkent (UTC+5)' },
  { value: 'UTC', label: 'UTC (UTC+0)' },
];

function BusinessHours() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timezone, setTimezone] = useState('Asia/Tashkent');

  // Mock initial data
  const [businessHours, setBusinessHours] = useState({
    monday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    tuesday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    wednesday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    thursday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    friday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
    saturday: { enabled: true, intervals: [{ start: '10:00', end: '16:00' }] },
    sunday: { enabled: false, intervals: [{ start: '10:00', end: '16:00' }] },
  });

  const handleDayToggle = (day) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }));
  };

  const handleAddInterval = (day) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        intervals: [...prev[day].intervals, { start: '09:00', end: '18:00' }],
      },
    }));
  };

  const handleRemoveInterval = (day, index) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        intervals: prev[day].intervals.filter((_, i) => i !== index),
      },
    }));
  };

  const handleIntervalChange = (day, index, field, value) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        intervals: prev[day].intervals.map((interval, i) =>
          i === index ? { ...interval, [field]: value } : interval
        ),
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Business hours saved:', { businessHours, timezone });
      toast.success('Ish vaqti saqlandi');
    } catch (error) {
      console.error('Error saving business hours:', error);
      toast.error('Ma\'lumotlarni saqlashda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Timezone */}
      <div className="space-y-2">
        <Label className="text-xs sm:text-sm">Vaqt mintaqasi</Label>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Business Hours */}
      <div className="space-y-4">
        <Label className="text-xs sm:text-sm">Ish vaqti</Label>
        {DAYS.map((day) => (
          <div
            key={day.value}
            className="border rounded-lg p-3 sm:p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={businessHours[day.value].enabled}
                  onCheckedChange={() => handleDayToggle(day.value)}
                />
                <Label className="text-sm sm:text-base font-medium">
                  {day.label}
                </Label>
              </div>
              {businessHours[day.value].enabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddInterval(day.value)}
                  className="text-xs sm:text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Qo'shish</span>
                </Button>
              )}
            </div>

            {businessHours[day.value].enabled && (
              <div className="space-y-2 pl-8">
                {businessHours[day.value].intervals.map((interval, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 flex-wrap"
                  >
                    <Input
                      type="time"
                      value={interval.start}
                      onChange={(e) =>
                        handleIntervalChange(day.value, index, 'start', e.target.value)
                      }
                      className="w-full sm:w-[140px] text-xs sm:text-sm"
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      dan
                    </span>
                    <Input
                      type="time"
                      value={interval.end}
                      onChange={(e) =>
                        handleIntervalChange(day.value, index, 'end', e.target.value)
                      }
                      className="w-full sm:w-[140px] text-xs sm:text-sm"
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      gacha
                    </span>
                    {businessHours[day.value].intervals.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveInterval(day.value, index)}
                        className="h-8 w-8"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setBusinessHours({
              monday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
              tuesday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
              wednesday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
              thursday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
              friday: { enabled: true, intervals: [{ start: '09:00', end: '18:00' }] },
              saturday: { enabled: true, intervals: [{ start: '10:00', end: '16:00' }] },
              sunday: { enabled: false, intervals: [{ start: '10:00', end: '16:00' }] },
            });
            setTimezone('Asia/Tashkent');
          }}
          className="text-xs sm:text-sm"
        >
          Bekor qilish
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="text-xs sm:text-sm">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Saqlash
        </Button>
      </div>
    </div>
  );
}

export default BusinessHours;

