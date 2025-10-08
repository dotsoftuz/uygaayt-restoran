'use client';

import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function DatePicker({ className, value, onChange }) {
  const [open, setOpen] = React.useState(false);

  // Handle different date formats (Date, Firestore Timestamp, string)
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Select date';

    try {
      let date;
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        // Firestore Timestamp
        date = dateValue.toDate();
      } else if (dateValue instanceof Date) {
        // Already a Date object
        date = dateValue;
      } else if (typeof dateValue === 'string') {
        // String date
        date = new Date(dateValue);
      } else {
        // Try to convert to Date
        date = new Date(dateValue);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Select date';
      }

      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Select date';
    }
  };

  // Convert value to Date object for Calendar component
  const getDateValue = () => {
    if (!value) return undefined;

    try {
      if (value.toDate && typeof value.toDate === 'function') {
        return value.toDate();
      } else if (value instanceof Date) {
        return value;
      } else if (typeof value === 'string') {
        return new Date(value);
      } else {
        return new Date(value);
      }
    } catch (error) {
      console.error('Error converting date:', error);
      return undefined;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className={`w-48 justify-between font-normal ${className}`}
          >
            {formatDate(value)}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={getDateValue()}
            captionLayout="dropdown"
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
