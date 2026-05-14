'use client';

import { useEffect, useState, use } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  availabilitiesApi,
  servicesApi,
  appointmentsApi,
  type Availability,
  type Service,
  DAY_LABELS,
  DAYS_ORDER,
  type DayOfWeek,
} from '@/lib/api';
import Link from 'next/link';
import { MiniCalendar } from '@/components/ui/mini-calendar';
import { TimeSlotPicker } from '@/components/ui/time-slot-picker';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  Star,
  CheckCircle2,
  AlertCircle,
  Leaf,
  ShieldCheck,
  Mail,
  User,
  FileText,
  Building2,
  Video,
} from 'lucide-react';

type BookStatus = 'idle' | 'submitting' | 'success' | 'error';

const CARD_COLORS = ['bg-teal-50', 'bg-amber-50', 'bg-purple-50', 'bg-blue-50', 'bg-green-50'];

export default function BookPage({
  params,
}: {
  params: Promise<{ professionalId: string }>;
}) {
  const { professionalId } = use(params);
  const profId = parseInt(professionalId, 10);
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId');

  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);

  const [form, setForm] = useState({
    patientName: '',
    patientEmail: '',
    serviceId: '',
    preferredDate: '',
    preferredTime: '',
    locationType: 'OFFICE' as 'OFFICE' | 'HOME' | 'VIRTUAL',
    address: '',
    notes: '',
  });
  const [status, setStatus] = useState<BookStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!form.preferredDate || isNaN(profId)) return;
    setOccupiedTimes([]);
    appointmentsApi.occupiedTimes(profId, form.preferredDate)
      .then(setOccupiedTimes)
      .catch(() => {});
  }, [form.preferredDate, profId]);

  useEffect(() => {
    if (isNaN(profId)) return;
    Promise.all([availabilitiesApi.byProfessional(profId), servicesApi.byProfessional(profId)])
      .then(([avs, svs]) => {
        setAvailabilities(avs);
        setServices(svs);
        if (preselectedServiceId) {
          const sv = svs.find((s) => String(s.id) === preselectedServiceId);
          if (sv) {
            setSelectedService(sv);
            const mod = sv.modality ?? 'PRESENCIAL';
            const defaultLoc = mod === 'VIRTUAL' ? 'VIRTUAL' : 'OFFICE';
            setForm((p) => ({ ...p, serviceId: String(sv.id), locationType: defaultLoc }));
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profId]);

  function setField(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    if (field === 'serviceId') {
      const sv = services.find((s) => String(s.id) === value);
      setSelectedService(sv ?? null);
      if (sv) {
        // Auto-select the only available modality
        const mod = sv.modality ?? 'PRESENCIAL';
        const defaultLoc = mod === 'VIRTUAL' ? 'VIRTUAL' : 'OFFICE';
        setForm((p) => ({ ...p, serviceId: value, locationType: defaultLoc }));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    if (!form.preferredDate) {
      setErrorMsg('Seleccioná una fecha antes de continuar.');
      return;
    }
    if (!form.preferredTime) {
      setErrorMsg('Seleccioná un horario antes de continuar.');
      return;
    }
    setStatus('submitting');
    try {
      await appointmentsApi.create({
        professionalId: profId,
        patientName: form.patientName,
        patientEmail: form.patientEmail,
        serviceId: parseInt(form.serviceId) || 0,
        date: form.preferredDate,
        time: form.preferredTime,
        locationType: form.locationType,
        ...(form.notes ? { notes: form.notes } : {}),
        ...(form.locationType === 'HOME' && form.address ? { address: form.address } : {}),
      });
      setStatus('success');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al enviar la solicitud');
      setStatus('error');
    }
  }

  const byDay = DAYS_ORDER.reduce(
    (acc, day) => {
      acc[day] = availabilities.filter((a) => a.dayOfWeek === day);
      return acc;
    },
    {} as Record<DayOfWeek, Availability[]>
  );
  const availableDays = DAYS_ORDER.filter((d) => byDay[d].length > 0);

  // Derive availability ranges for the selected date
  const JS_DAY_TO_DOW: Record<number, DayOfWeek> = {
    0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY',
    4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY',
  };
  const selectedDayRanges = (() => {
    if (!form.preferredDate) return [];
    const jsDay = new Date(form.preferredDate + 'T00:00:00').getDay();
    const dow = JS_DAY_TO_DOW[jsDay];
    return byDay[dow] ?? [];
  })();

  if (isNaN(profId)) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-destructive" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">
          Profesional no encontrado
        </h1>
        <Link href="/" className="text-primary hover:underline text-sm">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-9 h-9 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          ¡Solicitud enviada!
        </h1>
        <p className="text-muted-foreground mb-2">
          Tu solicitud de turno fue recibida correctamente.
        </p>
        <p className="text-muted-foreground text-sm mb-8">
          Recibirás una confirmación en{' '}
          <span className="font-semibold text-foreground">{form.patientEmail}</span>{' '}
          a la brevedad.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className={cn(buttonVariants(), 'rounded-full px-8')}
          >
            Volver al inicio
          </Link>
          <button
            onClick={() => {
              setStatus('idle');
              setForm({
                patientName: '',
                patientEmail: '',
                serviceId: '',
                preferredDate: '',
                preferredTime: '',
                locationType: 'OFFICE' as 'OFFICE' | 'HOME' | 'VIRTUAL',
                address: '',
                notes: '',
              });
              setSelectedService(null);
            }}
            className="text-primary text-sm hover:underline"
          >
            Solicitar otro turno
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Back + title */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Solicitar turno</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Completá el formulario — no necesitás estar registrado
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* ── Booking form (left) ── */}
        <div className="order-2 lg:order-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal info */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Tus datos
              </h2>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="patientName" className="text-sm font-medium">
                      Nombre completo *
                    </Label>
                    <Input
                      id="patientName"
                      required
                      value={form.patientName}
                      onChange={(e) => setField('patientName', e.target.value)}
                      placeholder="Ana García"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="patientEmail" className="text-sm font-medium">
                      Email *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="patientEmail"
                        type="email"
                        required
                        value={form.patientEmail}
                        onChange={(e) => setField('patientEmail', e.target.value)}
                        placeholder="ana@email.com"
                        className="pl-9 h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service + schedule */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Servicio y horario
              </h2>
              <div className="space-y-4">
                {/* Service select */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Servicio deseado *</Label>
                  {preselectedServiceId && selectedService ? (
                    <div className="w-full h-11 border border-input rounded-lg px-3 text-sm bg-muted/40 flex items-center justify-between">
                      <span className="font-medium text-foreground">{selectedService.name}</span>
                      <span className="text-muted-foreground">${selectedService.price.toLocaleString()}</span>
                    </div>
                  ) : (
                    <select
                      required
                      value={form.serviceId}
                      onChange={(e) => setField('serviceId', e.target.value)}
                      className="w-full h-11 border border-input rounded-lg px-3 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
                    >
                      <option value="">Seleccioná un servicio</option>
                      {services.map((sv) => (
                        <option key={sv.id} value={sv.id}>
                          {sv.name} — ${sv.price.toLocaleString()}
                        </option>
                      ))}
                      {services.length === 0 && (
                        <option value="0">Consultar disponibilidad</option>
                      )}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Fecha *</Label>
                  <MiniCalendar
                    value={form.preferredDate}
                    onChange={(date) =>
                      setForm((p) => ({ ...p, preferredDate: date, preferredTime: '' }))
                    }
                    availableDays={availableDays}
                  />
                  {!form.preferredDate && (
                    <p className="text-xs text-destructive">Seleccioná una fecha</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Hora *</Label>
                  <TimeSlotPicker
                    value={form.preferredTime}
                    onChange={(time) => setField('preferredTime', time)}
                    ranges={selectedDayRanges}
                    occupiedTimes={occupiedTimes}
                  />
                  {form.preferredDate && !form.preferredTime && (
                    <p className="text-xs text-destructive">Seleccioná un horario</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modality */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Modalidad de atención
              </h2>
              {!selectedService && (
                <p className="text-xs text-muted-foreground mb-4">Seleccioná un servicio para ver las modalidades disponibles.</p>
              )}
              {selectedService && (
                <p className="text-xs text-muted-foreground mb-4">
                  Modalidades habilitadas para <span className="font-medium text-foreground">{selectedService.name}</span>.
                </p>
              )}
              {(() => {
                const mod = selectedService?.modality ?? null;
                const presencialEnabled = mod === null ? false : mod === 'PRESENCIAL' || mod === 'AMBAS';
                const virtualEnabled = mod === null ? false : mod === 'VIRTUAL' || mod === 'AMBAS';
                return (
                  <div className="grid grid-cols-2 gap-3">
                    {/* PRESENCIAL */}
                    <button
                      key="OFFICE"
                      type="button"
                      disabled={!presencialEnabled}
                      onClick={() => presencialEnabled && setForm((p) => ({ ...p, locationType: 'OFFICE' }))}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors',
                        !presencialEnabled
                          ? 'border-border bg-muted/40 text-muted-foreground/50 cursor-not-allowed opacity-50'
                          : form.locationType === 'OFFICE'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border bg-transparent text-muted-foreground hover:border-muted-foreground/40'
                      )}
                    >
                      <Building2 className="w-5 h-5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Presencial</p>
                        <p className="text-xs text-muted-foreground">
                          {presencialEnabled ? 'Asistís al consultorio' : 'No disponible'}
                        </p>
                      </div>
                    </button>
                    {/* VIRTUAL */}
                    <button
                      key="VIRTUAL"
                      type="button"
                      disabled={!virtualEnabled}
                      onClick={() => virtualEnabled && setForm((p) => ({ ...p, locationType: 'VIRTUAL' }))}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors',
                        !virtualEnabled
                          ? 'border-border bg-muted/40 text-muted-foreground/50 cursor-not-allowed opacity-50'
                          : form.locationType === 'VIRTUAL'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border bg-transparent text-muted-foreground hover:border-muted-foreground/40'
                      )}
                    >
                      <Video className="w-5 h-5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Virtual</p>
                        <p className="text-xs text-muted-foreground">
                          {virtualEnabled ? 'Sesión por videollamada' : 'No disponible'}
                        </p>
                      </div>
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Notas adicionales
              </h2>
              <Textarea
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                placeholder="Contanos brevemente tu motivo de consulta, condición especial o cualquier información relevante..."
                rows={4}
                className="resize-none"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2.5 bg-destructive/8 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full h-12 rounded-xl text-sm font-semibold"
            >
              {status === 'submitting' ? 'Enviando...' : 'Solicitar turno'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              ¿Querés gestionar tus citas fácilmente?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Creá una cuenta gratis
              </Link>
            </p>
          </form>
        </div>

        {/* ── Sidebar (right) ── */}
        <div className="order-1 lg:order-2">
          <div className="sticky top-24 space-y-4">
            {/* Price summary */}
            {selectedService && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', CARD_COLORS[0])}>
                    <Leaf className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{selectedService.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-foreground text-foreground" />
                      <span className="text-xs text-muted-foreground">4.8 (80 reseñas)</span>
                    </div>
                  </div>
                </div>
                <Separator className="mb-4" />
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{selectedService.name}</span>
                  <span className="font-medium">${selectedService.price.toLocaleString()}</span>
                </div>
                <Separator className="mb-4" />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">${selectedService.price.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                Disponibilidad del profesional
              </h3>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : availableDays.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Aún no publicó su disponibilidad
                </p>
              ) : (
                <div className="space-y-3">
                  {availableDays.map((day) => (
                    <div key={day} className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs w-20 justify-center shrink-0">
                        {DAY_LABELS[day]}
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {byDay[day].map((av) => (
                          <span
                            key={av.id}
                            className="text-xs bg-primary/8 text-primary border border-primary/20 rounded px-2 py-0.5"
                          >
                            {av.startTime.slice(0, 5)}–{av.endTime.slice(0, 5)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="bg-muted/50 rounded-2xl border border-border p-5 space-y-3">
              {[
                { icon: <ShieldCheck className="w-4 h-4 text-primary" />, text: 'Profesionales verificados' },
                { icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, text: 'Confirmación por email' },
                { icon: <Leaf className="w-4 h-4 text-teal-600" />, text: 'Sin costo de reserva' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  {item.icon}
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
