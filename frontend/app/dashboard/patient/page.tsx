'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { servicesApi, type Service } from '@/lib/api';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import {
  CalendarCheck,
  Clock,
  BarChart3,
  Plus,
  ArrowRight,
  Leaf,
  Star,
  Syringe,
  Wind,
  Ear,
  Sparkles,
  Footprints,
  Flame,
  HandHeart,
  Activity,
} from 'lucide-react';

type TherapyKey =
  | 'acupuntura'
  | 'ventosas'
  | 'auriculoterapia'
  | 'masajes'
  | 'reiki'
  | 'reflexología'
  | 'default';

const THERAPY_ICONS: Record<TherapyKey, LucideIcon> = {
  acupuntura: Syringe,
  ventosas: Wind,
  auriculoterapia: Ear,
  masajes: HandHeart,
  reiki: Sparkles,
  reflexología: Footprints,
  default: Activity,
};

const THERAPY_COLORS: Record<TherapyKey, { bg: string; icon: string }> = {
  acupuntura: { bg: 'bg-teal-50', icon: 'text-teal-600' },
  ventosas: { bg: 'bg-sky-50', icon: 'text-sky-600' },
  auriculoterapia: { bg: 'bg-purple-50', icon: 'text-purple-600' },
  masajes: { bg: 'bg-rose-50', icon: 'text-rose-600' },
  reiki: { bg: 'bg-amber-50', icon: 'text-amber-600' },
  reflexología: { bg: 'bg-green-50', icon: 'text-green-600' },
  default: { bg: 'bg-slate-50', icon: 'text-slate-500' },
};

function getTherapyKey(name: string): TherapyKey {
  const lower = name.toLowerCase();
  const keys = Object.keys(THERAPY_ICONS) as TherapyKey[];
  return keys.find((k) => k !== 'default' && lower.includes(k)) ?? 'default';
}

const FALLBACK_COLORS = [
  { bg: 'bg-teal-50', icon: 'text-teal-600' },
  { bg: 'bg-sky-50', icon: 'text-sky-600' },
  { bg: 'bg-purple-50', icon: 'text-purple-600' },
  { bg: 'bg-amber-50', icon: 'text-amber-600' },
  { bg: 'bg-green-50', icon: 'text-green-600' },
  { bg: 'bg-rose-50', icon: 'text-rose-600' },
];

const FALLBACK_ICONS: LucideIcon[] = [Syringe, Wind, Ear, Sparkles, Footprints, Flame];

export default function PatientDashboard() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    servicesApi
      .list()
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Leaf className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Hola, {user?.name?.split(' ')[0]}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Gestioná tus citas y descubrí nuevos tratamientos
          </p>
        </div>
        <Link
          href="/"
          className={cn(buttonVariants(), 'rounded-xl gap-2 h-10')}
        >
          <Plus className="w-4 h-4" />
          Nueva cita
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'Pendientes',
            value: '0',
            Icon: Clock,
            iconColor: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Confirmadas',
            value: '0',
            Icon: CalendarCheck,
            iconColor: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Total sesiones',
            value: '0',
            Icon: BarChart3,
            iconColor: 'text-primary',
            bg: 'bg-primary/10',
          },
        ].map(({ label, value, Icon, iconColor, bg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3"
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', bg, iconColor)}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Appointments */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-foreground">Mis próximas citas</h2>
          <Link
            href="/"
            className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
          >
            Ver todo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="text-center py-14 border-2 border-dashed border-border rounded-2xl">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarCheck className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">
            Todavía no tenés citas agendadas
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            Explorá nuestros servicios y agendá tu primera sesión de terapia
          </p>
          <Link href="/" className={cn(buttonVariants(), 'rounded-full px-6')}>
            Explorar terapias
          </Link>
        </div>
      </div>

      {/* Services */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-foreground">Servicios disponibles</h2>
          <span className="text-xs text-muted-foreground">{services.length} opciones</span>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay servicios registrados aún</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {services.map((sv, i) => {
              const key = getTherapyKey(sv.name);
              const colors = key !== 'default' ? THERAPY_COLORS[key] : FALLBACK_COLORS[i % FALLBACK_COLORS.length];
              const Icon = key !== 'default' ? THERAPY_ICONS[key] : FALLBACK_ICONS[i % FALLBACK_ICONS.length];
              return (
                <div
                  key={sv.id}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-border bg-white hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center shrink-0', colors.bg)}>
                    <Icon className={cn('w-6 h-6', colors.icon)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-foreground text-sm truncate">{sv.name}</p>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Star className="w-3 h-3 fill-foreground text-foreground" />
                        <span className="text-xs font-medium">4.8</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                      {sv.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-foreground">
                        ${sv.price.toLocaleString()}
                      </span>
                      <Link
                        href="/"
                        className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5"
                      >
                        Agendar <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="mt-6 bg-linear-to-br from-primary/5 to-teal-50 border border-primary/15 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Leaf className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm mb-1">Consejo de bienestar</p>
          <p className="text-muted-foreground text-sm">
            La constancia es clave en las terapias alternativas. Agendá sesiones
            regulares para obtener los mejores resultados.
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0 text-xs">Tip</Badge>
      </div>
    </div>
  );
}
