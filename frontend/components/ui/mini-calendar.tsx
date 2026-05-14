'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DayOfWeek } from '@/lib/api';

// Maps DayOfWeek enum value → JS getDay() (0=Sun … 6=Sat)
const DAY_OF_WEEK_TO_JS: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// Week header starting on Monday
const WEEK_HEADERS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

function toIsoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

interface MiniCalendarProps {
  value: string; // 'YYYY-MM-DD' or ''
  onChange: (date: string) => void;
  availableDays: DayOfWeek[]; // which weekdays are enabled
}

export function MiniCalendar({ value, onChange, availableDays }: MiniCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initial = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const enabledJsDays = new Set(availableDays.map((d) => DAY_OF_WEEK_TO_JS[d]));

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  // First day of month (0=Sun … 6=Sat), shifted to Monday-first grid
  const firstDow = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const gridOffset = (firstDow + 6) % 7; // Mon=0 … Sun=6
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(gridOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="border border-input rounded-xl overflow-hidden bg-white select-none w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 rounded-md hover:bg-muted transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 rounded-md hover:bg-muted transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 px-2 pt-2">
        {WEEK_HEADERS.map((h) => (
          <div key={h} className="text-center text-xs font-medium text-muted-foreground py-1">
            {h}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 px-2 pb-3 gap-y-0.5">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`e-${idx}`} />;
          }

          const date = new Date(viewYear, viewMonth, day);
          date.setHours(0, 0, 0, 0);
          const isPast = date < today;
          const jsDay = date.getDay();
          const isEnabled = enabledJsDays.size === 0 || enabledJsDays.has(jsDay);
          const isoDate = toIsoDate(viewYear, viewMonth, day);
          const isSelected = isoDate === value;
          const isToday = date.getTime() === today.getTime();
          const disabled = isPast || !isEnabled;

          return (
            <button
              key={isoDate}
              type="button"
              disabled={disabled}
              onClick={() => onChange(isoDate)}
              className={cn(
                'mx-auto w-8 h-8 rounded-full text-xs flex items-center justify-center transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : disabled
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : 'hover:bg-primary/10 text-foreground cursor-pointer',
                isToday && !isSelected && !disabled && 'ring-1 ring-primary font-medium',
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {value && (
        <div className="px-4 pb-3 text-xs text-muted-foreground text-center border-t border-border pt-2">
          Seleccionado:{' '}
          <span className="font-medium text-foreground">
            {new Date(value + 'T00:00:00').toLocaleDateString('es-AR', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </span>
        </div>
      )}
    </div>
  );
}
