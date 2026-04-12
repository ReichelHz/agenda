'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  availabilitiesApi,
  servicesApi,
  type Availability,
  type Service,
  type DayOfWeek,
  DAY_LABELS,
  DAYS_ORDER,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Calendar,
  Plus,
  Link2,
  CheckCircle2,
  Clock,
  Stethoscope,
  User,
  Scissors,
} from 'lucide-react';

export default function ProfessionalDashboard() {
  const { user } = useAuth();

  // Availability state
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [avLoading, setAvLoading] = useState(true);
  const [avForm, setAvForm] = useState<{
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
  }>({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '17:00',
  });
  const [avSaving, setAvSaving] = useState(false);
  const [avError, setAvError] = useState('');
  const [avSuccess, setAvSuccess] = useState('');

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [svLoading, setSvLoading] = useState(true);
  const [svForm, setSvForm] = useState({ name: '', description: '', price: '', duration: '' });
  const [svSaving, setSvSaving] = useState(false);
  const [svError, setSvError] = useState('');
  const [svSuccess, setSvSuccess] = useState('');

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    availabilitiesApi
      .byProfessional(user.id)
      .then(setAvailabilities)
      .catch(() => setAvailabilities([]))
      .finally(() => setAvLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    servicesApi
      .byProfessional(user.id)
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setSvLoading(false));
  }, [user]);

  async function handleAddAvailability(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setAvError('');
    setAvSuccess('');
    setAvSaving(true);
    try {
      const created = await availabilitiesApi.create({
        professional: { id: user.id },
        dayOfWeek: avForm.dayOfWeek,
        startTime: avForm.startTime + ':00',
        endTime: avForm.endTime + ':00',
      });
      setAvailabilities((prev) => [...prev, created]);
      setAvSuccess('Horario agregado correctamente');
      setTimeout(() => setAvSuccess(''), 4000);
    } catch (err: unknown) {
      setAvError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setAvSaving(false);
    }
  }

  async function handleAddService(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setSvError('');
    setSvSuccess('');
    setSvSaving(true);
    try {
      const created = await servicesApi.create({
        name: svForm.name,
        description: svForm.description,
        price: parseFloat(svForm.price),
        durationMinutes: svForm.duration ? parseInt(svForm.duration) : undefined,
        professional: { id: user.id },
      });
      setServices((prev) => [...prev, created]);
      setSvForm({ name: '', description: '', price: '', duration: '' });
      setSvSuccess('Servicio creado correctamente');
      setTimeout(() => setSvSuccess(''), 4000);
    } catch (err: unknown) {
      setSvError(err instanceof Error ? err.message : 'Error al crear servicio');
    } finally {
      setSvSaving(false);
    }
  }

  const bookingUrl =
    user && typeof window !== 'undefined'
      ? `${window.location.origin}/book/${user.id}`
      : '';

  function copyBookingUrl() {
    if (!bookingUrl) return;
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  const byDay = DAYS_ORDER.reduce(
    (acc, day) => {
      acc[day] = availabilities.filter((a) => a.dayOfWeek === day);
      return acc;
    },
    {} as Record<DayOfWeek, Availability[]>
  );

  const activeDays = DAYS_ORDER.filter((d) => byDay[d].length > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Panel Profesional</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Hola, <strong>{user?.name}</strong> — gestioná tus horarios y servicios
          </p>
        </div>

        <button
          onClick={copyBookingUrl}
          className="flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/15 transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              ¡Copiado!
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              Copiar link de reservas
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Días disponibles', value: activeDays.length, icon: <Calendar className="w-4 h-4" /> },
          { label: 'Servicios', value: services.length, icon: <Scissors className="w-4 h-4" /> },
          { label: 'Reservas hoy', value: 0, icon: <Clock className="w-4 h-4" /> },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {s.icon}
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="availability">
        <TabsList variant="line" className="mb-6 w-full border-b border-border rounded-none pb-0">
          <TabsTrigger value="availability" className="gap-2 pb-3">
            <Calendar className="w-4 h-4" />
            Disponibilidad
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2 pb-3">
            <Scissors className="w-4 h-4" />
            Servicios
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2 pb-3">
            <User className="w-4 h-4" />
            Mi Perfil
          </TabsTrigger>
        </TabsList>

        {/* ── Availability ── */}
        <TabsContent value="availability">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Agregar bloque de horario
              </h2>

              <form onSubmit={handleAddAvailability} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Día de la semana</Label>
                  <select
                    value={avForm.dayOfWeek}
                    onChange={(e) =>
                      setAvForm((p) => ({ ...p, dayOfWeek: e.target.value as DayOfWeek }))
                    }
                    className="w-full h-11 border border-input rounded-lg px-3 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
                  >
                    {DAYS_ORDER.map((day) => (
                      <option key={day} value={day}>
                        {DAY_LABELS[day]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Hora inicio</Label>
                    <Input
                      type="time"
                      value={avForm.startTime}
                      onChange={(e) =>
                        setAvForm((p) => ({ ...p, startTime: e.target.value }))
                      }
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Hora fin</Label>
                    <Input
                      type="time"
                      value={avForm.endTime}
                      onChange={(e) =>
                        setAvForm((p) => ({ ...p, endTime: e.target.value }))
                      }
                      className="h-11"
                    />
                  </div>
                </div>

                {avError && (
                  <p className="text-destructive text-sm bg-destructive/8 border border-destructive/20 px-3 py-2 rounded-lg">
                    {avError}
                  </p>
                )}
                {avSuccess && (
                  <p className="text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {avSuccess}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={avSaving}
                  className="w-full h-11 rounded-xl"
                >
                  {avSaving ? 'Guardando...' : '+ Agregar horario'}
                </Button>
              </form>
            </div>

            {/* Current schedule */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Mi disponibilidad actual
              </h2>

              {avLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : activeDays.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Todavía no cargaste horarios
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeDays.map((day) => (
                    <div key={day} className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-24 justify-center shrink-0 text-xs">
                        {DAY_LABELS[day]}
                      </Badge>
                      <div className="flex flex-wrap gap-1.5">
                        {byDay[day].map((av) => (
                          <span
                            key={av.id}
                            className="text-xs bg-primary/8 text-primary border border-primary/20 rounded-md px-2.5 py-1 font-medium"
                          >
                            {av.startTime.slice(0, 5)} – {av.endTime.slice(0, 5)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Services ── */}
        <TabsContent value="services">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Crear servicio
              </h2>

              <form onSubmit={handleAddService} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Nombre del servicio *</Label>
                  <Input
                    required
                    value={svForm.name}
                    onChange={(e) => setSvForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ej: Acupuntura 60 min"
                    className="h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Descripción *</Label>
                  <Textarea
                    required
                    value={svForm.description}
                    onChange={(e) => setSvForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Describí brevemente el servicio..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Precio ($) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        $
                      </span>
                      <Input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={svForm.price}
                        onChange={(e) => setSvForm((p) => ({ ...p, price: e.target.value }))}
                        placeholder="5000"
                        className="pl-7 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Duración (minutos)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="15"
                      value={svForm.duration}
                      onChange={(e) => setSvForm((p) => ({ ...p, duration: e.target.value }))}
                      placeholder="60"
                      className="h-11"
                    />
                  </div>

                {svError && (
                  <p className="text-destructive text-sm bg-destructive/8 border border-destructive/20 px-3 py-2 rounded-lg">
                    {svError}
                  </p>
                )}
                {svSuccess && (
                  <p className="text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {svSuccess}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={svSaving}
                  className="w-full h-11 rounded-xl"
                >
                  {svSaving ? 'Guardando...' : '+ Crear servicio'}
                </Button>
              </form>
            </div>

            {/* Services list */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-primary" />
                Servicios activos
              </h2>

              {svLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-12">
                  <Scissors className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No hay servicios aún
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {services.map((sv) => (
                    <div
                      key={sv.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {sv.name}
                        </p>
                        <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                          {sv.description}
                        </p>
                      </div>
                      <span className="text-primary font-bold text-sm ml-4 shrink-0">
                        ${sv.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Profile ── */}
        <TabsContent value="profile">
          <div className="bg-white rounded-2xl border border-border p-6 max-w-lg">
            <h2 className="font-semibold text-foreground mb-6">Mi perfil</h2>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">{user?.name}</p>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
                <Badge variant="secondary" className="mt-1.5 text-xs">
                  Profesional verificado ✓
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Tu link de reservas</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={bookingUrl}
                  className="flex-1 text-sm text-muted-foreground bg-muted/50 h-11"
                />
                <Button
                  onClick={copyBookingUrl}
                  variant="outline"
                  className="h-11 px-4 shrink-0 rounded-xl"
                >
                  {copied ? '¡Copiado!' : 'Copiar'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Compartí este link para que tus pacientes reserven online directamente
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
