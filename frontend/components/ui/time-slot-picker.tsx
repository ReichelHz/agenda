'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeRange {
  startTime: string; // 'HH:MM' or 'HH:MM:SS'
  endTime: string;
}

interface TimeSlotPickerProps {
  value: string; // 'HH:MM'
  onChange: (time: string) => void;
  ranges: TimeRange[];
  occupiedTimes?: string[]; // 'HH:MM' slots already booked
  stepMinutes?: number;
}

function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function fromMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function generateSlots(ranges: TimeRange[], step: number): string[] {
  const slots: string[] = [];
  for (const { startTime, endTime } of ranges) {
    const start = toMinutes(startTime);
    const end = toMinutes(endTime);
    for (let t = start; t < end; t += step) {
      slots.push(fromMinutes(t));
    }
  }
  return slots;
}

export function TimeSlotPicker({
  value,
  onChange,
  ranges,
  occupiedTimes = [],
  stepMinutes = 30,
}: TimeSlotPickerProps) {
  if (ranges.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground border border-input rounded-xl px-4 py-3 bg-muted/30">
        <Clock className="w-4 h-4 shrink-0" />
        Seleccioná una fecha para ver los horarios disponibles
      </div>
    );
  }

  const slots = generateSlots(ranges, stepMinutes);

  if (slots.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground border border-input rounded-xl px-4 py-3 bg-muted/30">
        <Clock className="w-4 h-4 shrink-0" />
        Sin horarios disponibles para ese día
      </div>
    );
  }

  const occupiedSet = new Set(occupiedTimes);

  return (
    <div className="border border-input rounded-xl p-3 bg-white">
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => {
          const occupied = occupiedSet.has(slot);
          const selected = value === slot;
          return (
            <button
              key={slot}
              type="button"
              disabled={occupied}
              onClick={() => !occupied && onChange(slot)}
              title={occupied ? 'Horario ocupado' : undefined}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                selected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : occupied
                  ? 'border-border bg-muted/50 text-muted-foreground/50 cursor-not-allowed line-through'
                  : 'border-border text-foreground hover:border-primary hover:bg-primary/5'
              )}
            >
              {slot}
            </button>
          );
        })}
      </div>
      {occupiedSet.size > 0 && (
        <p className="text-xs text-muted-foreground mt-2 pl-1">
          Los horarios tachados ya están reservados
        </p>
      )}
    </div>
  );
}
