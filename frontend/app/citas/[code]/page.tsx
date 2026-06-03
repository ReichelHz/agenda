'use client';

import { use, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { appointmentsApi, type Appointment, type AppointmentStatus } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Clock,
  User,
  Leaf,
  ArrowLeft,
  Building2,
  Video,
  Home,
  Loader2,
  Hash,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: 'Pendiente de confirmación',
    className: 'border-amber-300 text-amber-700 bg-amber-50',
    icon: <AlertCircle className="w-4 h-4" />,
  },
  CONFIRMED: {
    label: 'Confirmada',
    className: 'border-emerald-300 text-emerald-700 bg-emerald-50',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  CANCELLED: {
    label: 'Cancelada',
    className: 'border-red-200 text-red-600 bg-red-50',
    icon: <XCircle className="w-4 h-4" />,
  },
};

const LOCATION_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  OFFICE:  { label: 'Presencial (consultorio)', icon: <Building2 className="w-4 h-4" /> },
  VIRTUAL: { label: 'Virtual (videollamada)',   icon: <Video className="w-4 h-4" /> },
  HOME:    { label: 'Visita a domicilio',       icon: <Home className="w-4 h-4" /> },
};

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-');
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function CitaContent({ code }: { code: string }) {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') ?? '';

  const [emailInput, setEmailInput] = useState(emailParam);
  const [submittedEmail, setSubmittedEmail] = useState(emailParam);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(!!emailParam);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!submittedEmail) return;
    setLoading(true);
    setLoadError('');
    appointmentsApi
      .getByCode(code, submittedEmail)
      .then(setAppointment)
      .catch((err: unknown) =>
        setLoadError(err instanceof Error ? err.message : 'No se encontró la cita')
      )
      .finally(() => setLoading(false));
  }, [code, submittedEmail]);

  async function handleAction(status: AppointmentStatus) {
    if (!appointment) return;
    setActionLoading(true);
    setActionError('');
    try {
      const updated = await appointmentsApi.updateStatusByCode(code, submittedEmail, status);
      setAppointment(updated);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Error al procesar la solicitud');
    } finally {
      setActionLoading(false);
    }
  }

  /* ── Email gate ── */
  if (!submittedEmail) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground text-center mb-2">
            Verificar identidad
          </h1>
          <p className="text-muted-foreground text-sm text-center mb-6">
            Ingresa el email con el que realizaste la reserva para ver los detalles de la cita.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmittedEmail(emailInput.trim().toLowerCase());
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email de la reserva
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="tu@email.com"
                className="h-11"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl">
              Ver mi cita
            </Button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  /* ── Error ── */
  if (loadError || !appointment) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Cita no encontrada</h1>
        <p className="text-muted-foreground text-sm mb-6">
          {loadError || 'El código o email no coinciden con ninguna reserva.'}
        </p>
        <Button variant="outline" onClick={() => { setSubmittedEmail(''); setEmailInput(''); }} className="rounded-xl">
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[appointment.status];
  const locationCfg = appointment.locationType ? LOCATION_LABELS[appointment.locationType] : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al inicio
      </Link>

      <div className="space-y-4">
        {/* Status card */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-xl font-bold text-foreground mb-1">Tu cita</h1>
              <p className="text-muted-foreground text-sm">
                Código de reserva:{' '}
                <span className="font-mono font-semibold text-foreground">{appointment.reservationCode}</span>
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn('flex items-center gap-1.5 text-xs font-medium shrink-0', statusCfg.className)}
            >
              {statusCfg.icon}
              {statusCfg.label}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Profesional</p>
                <p className="font-medium text-foreground">{appointment.professionalName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Hash className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Servicio</p>
                <p className="font-medium text-foreground">{appointment.serviceName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="font-medium text-foreground capitalize">{formatDate(String(appointment.date))}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hora</p>
                <p className="font-medium text-foreground">
                  {String(appointment.time).slice(0, 5)}
                </p>
              </div>
            </div>

            {locationCfg && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                  {locationCfg.icon}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Modalidad</p>
                  <p className="font-medium text-foreground">{locationCfg.label}</p>
                  {appointment.address && (
                    <p className="text-xs text-muted-foreground mt-0.5">{appointment.address}</p>
                  )}
                </div>
              </div>
            )}

            {appointment.totalPrice != null && (
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-bold text-foreground">
                  ${Number(appointment.totalPrice).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {appointment.status === 'PENDING' && (
          <div className="bg-white rounded-2xl border border-border p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Tu cita está pendiente. Puedes confirmar tu asistencia o cancelarla si lo necesitas.
            </p>

            {actionError && (
              <div className="flex items-center gap-2 bg-destructive/8 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {actionError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => handleAction('CONFIRMED')}
                disabled={actionLoading}
                className="flex-1 h-11 rounded-xl gap-2"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Confirmar asistencia
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction('CANCELLED')}
                disabled={actionLoading}
                className="flex-1 h-11 rounded-xl gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Cancelar cita
              </Button>
            </div>
          </div>
        )}

        {appointment.status === 'CONFIRMED' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-800 text-sm mb-1">Cita confirmada</p>
                <p className="text-emerald-700 text-sm">
                  Tu asistencia está confirmada. ¡Te esperamos en la cita!
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => handleAction('CANCELLED')}
              disabled={actionLoading}
              className="w-full mt-4 h-10 rounded-xl text-sm gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Cancelar de todas formas
            </Button>
            {actionError && (
              <p className="text-destructive text-sm mt-2">{actionError}</p>
            )}
          </div>
        )}

        {appointment.status === 'CANCELLED' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 text-sm mb-1">Cita cancelada</p>
                <p className="text-red-600 text-sm">
                  Esta cita fue cancelada. Puedes agendar una nueva cuando quieras.
                </p>
              </div>
            </div>
            <Link href="/" className="block mt-4">
              <Button className="w-full h-10 rounded-xl text-sm">
                Agendar nueva cita
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CitaPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  return (
    <Suspense>
      <CitaContent code={code} />
    </Suspense>
  );
}
