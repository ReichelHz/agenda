'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  availabilitiesApi,
  servicesApi,
  professionalApi,
  usersApi,
  type Availability,
  type Service,
  type ServiceModality,
  type ProfessionalProfile,
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
import { Switch } from '@/components/ui/switch';
import {
  Calendar,
  Plus,
  Link2,
  CheckCircle2,
  Clock,
  Stethoscope,
  User,
  Scissors,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  X,
  Save,
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
  const [svForm, setSvForm] = useState({ name: '', description: '', price: '', duration: '', modality: 'PRESENCIAL' as ServiceModality });
  const [svDurationMode, setSvDurationMode] = useState<'preset' | 'custom'>('preset');
  const [svSaving, setSvSaving] = useState(false);
  const [svError, setSvError] = useState('');
  const [svSuccess, setSvSuccess] = useState('');

  // Service editing state
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editSvForm, setEditSvForm] = useState({ name: '', description: '', price: '', duration: '', modality: 'PRESENCIAL' as ServiceModality });
  const [editSvDurationMode, setEditSvDurationMode] = useState<'preset' | 'custom'>('preset');
  const [editSvSaving, setEditSvSaving] = useState(false);

  const [copied, setCopied] = useState(false);

  // Password change state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwShow, setPwShow] = useState({ current: false, next: false, confirm: false });

  // Professional profile state
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    name: '',
    description: '',
    phone: '',
    birthDate: '',
    homeVisitFee: '',
    allowsHomeVisit: true,
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

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

  useEffect(() => {
    professionalApi
      .getSettings()
      .then((p) => {
        setProfile(p);
        setProfileForm({
          name: p.name ?? '',
          description: p.description ?? '',
          phone: p.phone ?? '',
          birthDate: p.birthDate ?? '',
          homeVisitFee: p.homeVisitFee != null ? String(p.homeVisitFee) : '',
          allowsHomeVisit: p.allowsHomeVisit,
        });
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

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
        modality: svForm.modality,
        professional: { id: user.id },
      });
      setServices((prev) => [...prev, created]);
      setSvForm({ name: '', description: '', price: '', duration: '', modality: 'PRESENCIAL' });
      setSvDurationMode('preset');
      setSvSuccess('Servicio creado correctamente');
      setTimeout(() => setSvSuccess(''), 4000);
    } catch (err: unknown) {
      setSvError(err instanceof Error ? err.message : 'Error al crear servicio');
    } finally {
      setSvSaving(false);
    }
  }

  function startEditService(sv: Service) {
    setEditingServiceId(sv.id);
    const dur = sv.durationMinutes ? String(sv.durationMinutes) : '';
    const presets = ['15', '20', '30', '45', '60', '90', '120'];
    setEditSvDurationMode(dur && !presets.includes(dur) ? 'custom' : 'preset');
    setEditSvForm({
      name: sv.name,
      description: sv.description ?? '',
      price: String(sv.price),
      duration: dur,
      modality: sv.modality,
    });
  }

  async function handleSaveServiceEdit(id: number) {
    setEditSvSaving(true);
    try {
      const updated = await servicesApi.update(id, {
        name: editSvForm.name,
        description: editSvForm.description,
        price: parseFloat(editSvForm.price),
        durationMinutes: editSvForm.duration ? parseInt(editSvForm.duration) : undefined,
        modality: editSvForm.modality,
      });
      setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
      setEditingServiceId(null);
    } catch (err: unknown) {
      setSvError(err instanceof Error ? err.message : 'Error al guardar cambios');
      setTimeout(() => setSvError(''), 4000);
    } finally {
      setEditSvSaving(false);
    }
  }

  async function handleDeleteAvailability(id: number) {
    try {
      await availabilitiesApi.delete(id);
      setAvailabilities((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setAvError('No se pudo eliminar el horario');
      setTimeout(() => setAvError(''), 4000);
    }
  }

  async function handleDeleteService(id: number) {
    try {
      await servicesApi.delete(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setSvError('No se pudo eliminar el servicio');
      setTimeout(() => setSvError(''), 4000);
    }
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (pwForm.next !== pwForm.confirm) {
      setPwError('Las contraseñas nuevas no coinciden');
      return;
    }
    setPwSaving(true);
    try {
      await usersApi.changePassword(pwForm.current, pwForm.next);
      setPwForm({ current: '', next: '', confirm: '' });
      setPwSuccess('Contraseña actualizada correctamente');
      setTimeout(() => setPwSuccess(''), 5000);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Error al cambiar la contraseña');
    } finally {
      setPwSaving(false);
    }
  }

  async function saveProfile() {
    setProfileError('');
    setProfileSuccess('');
    setProfileSaving(true);
    try {
      const updated = await professionalApi.updateSettings({
        name: profileForm.name,
        description: profileForm.description,
        phone: profileForm.phone,
        birthDate: profileForm.birthDate || undefined,
        homeVisitFee: profileForm.homeVisitFee ? parseFloat(profileForm.homeVisitFee) : undefined,
        allowsHomeVisit: profileForm.allowsHomeVisit,
      });
      setProfile(updated);
      setProfileSuccess('Perfil actualizado correctamente');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Error al guardar el perfil');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await saveProfile();
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

  const MODALITY_OPTS: { value: ServiceModality; label: string; desc: string }[] = [
    { value: 'PRESENCIAL', label: 'Presencial', desc: 'Solo en consultorio' },
    { value: 'VIRTUAL', label: 'Virtual', desc: 'Solo por videollamada' },
    { value: 'AMBAS', label: 'Ambas', desc: 'Presencial o virtual' },
  ];

  const DURATION_PRESETS = [15, 20, 30, 45, 60, 90, 120];

  function durationLabel(min: number) {
    if (min < 60) return `${min} min`;
    if (min === 60) return '1 hora';
    return `${Math.floor(min / 60)}h ${min % 60 > 0 ? `${min % 60}min` : ''}`.trim();
  }

  function modalityBadge(modality: ServiceModality) {
    if (modality === 'VIRTUAL') return 'bg-blue-100 text-blue-700';
    if (modality === 'AMBAS') return 'bg-purple-100 text-purple-700';
    return 'bg-emerald-100 text-emerald-700';
  }

  function modalityText(modality: ServiceModality) {
    if (modality === 'PRESENCIAL') return 'Presencial';
    if (modality === 'VIRTUAL') return 'Virtual';
    return 'Ambas';
  }

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
            Hola, <strong>{profile?.name ?? user?.name}</strong> — gestioná tus horarios y servicios
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
                    <div key={day} className="flex items-start gap-3">
                      <Badge variant="secondary" className="w-24 justify-center shrink-0 text-xs mt-1">
                        {DAY_LABELS[day]}
                      </Badge>
                      <div className="flex flex-wrap gap-1.5">
                        {byDay[day].map((av) => (
                          <span
                            key={av.id}
                            className="group flex items-center gap-1 text-xs bg-primary/8 text-primary border border-primary/20 rounded-md pl-2.5 pr-1.5 py-1 font-medium"
                          >
                            {av.startTime.slice(0, 5)} – {av.endTime.slice(0, 5)}
                            <button
                              type="button"
                              onClick={() => handleDeleteAvailability(av.id)}
                              className="opacity-0 group-hover:opacity-100 ml-0.5 text-primary/60 hover:text-destructive transition-all"
                              title="Eliminar horario"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
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
            {/* Create form */}
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
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
                  <Label className="text-sm font-medium">Duración</Label>
                  <select
                    value={svDurationMode === 'custom' ? 'custom' : svForm.duration}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setSvDurationMode('custom');
                        setSvForm((p) => ({ ...p, duration: '' }));
                      } else {
                        setSvDurationMode('preset');
                        setSvForm((p) => ({ ...p, duration: e.target.value }));
                      }
                    }}
                    className="w-full h-11 border border-input rounded-lg px-3 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
                  >
                    <option value="">Sin especificar</option>
                    {DURATION_PRESETS.map((min) => (
                      <option key={min} value={String(min)}>{durationLabel(min)}</option>
                    ))}
                    <option value="custom">Personalizado...</option>
                  </select>
                  {svDurationMode === 'custom' && (
                    <div className="relative mt-2">
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        autoFocus
                        value={svForm.duration}
                        onChange={(e) => setSvForm((p) => ({ ...p, duration: e.target.value }))}
                        placeholder="Ej: 75"
                        className="h-11 pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">min</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Modalidad de atención *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {MODALITY_OPTS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSvForm((p) => ({ ...p, modality: opt.value }))}
                        className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 text-center transition-colors text-xs ${
                          svForm.modality === opt.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border bg-transparent text-muted-foreground hover:border-muted-foreground/40'
                        }`}
                      >
                        <span className="font-semibold">{opt.label}</span>
                        <span className="text-[10px] leading-tight opacity-80">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
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

                <Button type="submit" disabled={svSaving} className="w-full h-11 rounded-xl">
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
                  <p className="text-sm text-muted-foreground">No hay servicios aún</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((sv) =>
                    editingServiceId === sv.id ? (
                      /* Inline edit form */
                      <div key={sv.id} className="border-2 border-primary/30 rounded-xl p-4 space-y-3 bg-primary/2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-primary">Editando servicio</span>
                          <button
                            type="button"
                            onClick={() => setEditingServiceId(null)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <Input
                          value={editSvForm.name}
                          onChange={(e) => setEditSvForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Nombre del servicio"
                          className="h-9 text-sm"
                        />
                        <Textarea
                          value={editSvForm.description}
                          onChange={(e) => setEditSvForm((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Descripción"
                          rows={2}
                          className="resize-none text-sm"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editSvForm.price}
                              onChange={(e) => setEditSvForm((p) => ({ ...p, price: e.target.value }))}
                              placeholder="Precio"
                              className="pl-6 h-9 text-sm"
                            />
                          </div>
                          <div>
                            <select
                              value={editSvDurationMode === 'custom' ? 'custom' : editSvForm.duration}
                              onChange={(e) => {
                                if (e.target.value === 'custom') {
                                  setEditSvDurationMode('custom');
                                  setEditSvForm((p) => ({ ...p, duration: '' }));
                                } else {
                                  setEditSvDurationMode('preset');
                                  setEditSvForm((p) => ({ ...p, duration: e.target.value }));
                                }
                              }}
                              className="w-full h-9 border border-input rounded-lg px-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-ring/50"
                            >
                              <option value="">Sin duración</option>
                              {DURATION_PRESETS.map((min) => (
                                <option key={min} value={String(min)}>{durationLabel(min)}</option>
                              ))}
                              <option value="custom">Otro...</option>
                            </select>
                            {editSvDurationMode === 'custom' && (
                              <div className="relative mt-1.5">
                                <Input
                                  type="number"
                                  min="1"
                                  value={editSvForm.duration}
                                  onChange={(e) => setEditSvForm((p) => ({ ...p, duration: e.target.value }))}
                                  placeholder="min"
                                  className="h-9 text-sm pr-12"
                                />
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none">min</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          {MODALITY_OPTS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setEditSvForm((p) => ({ ...p, modality: opt.value }))}
                              className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors ${
                                editSvForm.modality === opt.value
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-border text-muted-foreground hover:border-muted-foreground/40'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleSaveServiceEdit(sv.id)}
                          disabled={editSvSaving}
                          className="w-full gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {editSvSaving ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                      </div>
                    ) : (
                      /* Normal card */
                      <div
                        key={sv.id}
                        className="group flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-foreground text-sm truncate">{sv.name}</p>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${modalityBadge(sv.modality)}`}>
                              {modalityText(sv.modality)}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{sv.description}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4 shrink-0">
                          <span className="text-primary font-bold text-sm">${sv.price.toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => startEditService(sv)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all"
                            title="Editar servicio"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(sv.id)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                            title="Eliminar servicio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Profile ── */}
        <TabsContent value="profile">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Edit profile form */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Editar perfil
              </h2>

              {profileLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-11 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Nombre completo *</Label>
                    <Input
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Tu nombre"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input
                      readOnly
                      value={profile?.email ?? ''}
                      className="h-11 bg-muted/50 text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">El email no puede modificarse</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Teléfono</Label>
                    <Input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="Ej: +54 9 11 1234-5678"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Fecha de nacimiento</Label>
                    <Input
                      type="date"
                      value={profileForm.birthDate}
                      onChange={(e) => setProfileForm((p) => ({ ...p, birthDate: e.target.value }))}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Descripción / Bio</Label>
                    <Textarea
                      value={profileForm.description}
                      onChange={(e) => setProfileForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Contá brevemente tu especialidad, formación o enfoque..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  {profileError && (
                    <p className="text-destructive text-sm bg-destructive/8 border border-destructive/20 px-3 py-2 rounded-lg">
                      {profileError}
                    </p>
                  )}
                  {profileSuccess && (
                    <p className="text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {profileSuccess}
                    </p>
                  )}

                  <Button type="submit" disabled={profileSaving} className="w-full h-11 rounded-xl gap-2">
                    <Save className="w-4 h-4" />
                    {profileSaving ? 'Guardando...' : 'Guardar perfil'}
                  </Button>
                </form>
              )}
            </div>

            {/* Right column: home visit settings + booking link + password */}
            <div className="space-y-6">
              {/* Home visit settings */}
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="font-semibold text-foreground mb-5">Visitas a domicilio</h2>
                {profileLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-11 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-xl">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">Acepto visitas a domicilio</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Los pacientes podrán solicitarte atención en su domicilio</p>
                      </div>
                      <Switch
                        checked={profileForm.allowsHomeVisit}
                        onCheckedChange={(checked) => setProfileForm((p) => ({ ...p, allowsHomeVisit: checked }))}
                      />
                    </div>
                    {profileForm.allowsHomeVisit && (
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Costo visita domiciliaria ($)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={profileForm.homeVisitFee}
                            onChange={(e) => setProfileForm((p) => ({ ...p, homeVisitFee: e.target.value }))}
                            placeholder="0"
                            className="pl-7 h-11"
                          />
                        </div>
                      </div>
                    )}
                    <Button
                      type="button"
                      onClick={saveProfile}
                      disabled={profileSaving}
                      variant="outline"
                      className="w-full h-10 rounded-xl text-sm gap-2"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {profileSaving ? 'Guardando...' : 'Guardar configuración'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Booking link */}
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="font-semibold text-foreground mb-4">Tu link de reservas</h2>
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
                <p className="text-xs text-muted-foreground mt-2">
                  Compartí este link para que tus pacientes reserven online
                </p>
              </div>

              {/* Change password */}
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Cambiar contraseña
                </h2>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  {[
                    { field: 'current', label: 'Contraseña actual', show: pwShow.current, toggle: () => setPwShow((p) => ({ ...p, current: !p.current })) },
                    { field: 'next', label: 'Nueva contraseña', show: pwShow.next, toggle: () => setPwShow((p) => ({ ...p, next: !p.next })) },
                    { field: 'confirm', label: 'Confirmar nueva contraseña', show: pwShow.confirm, toggle: () => setPwShow((p) => ({ ...p, confirm: !p.confirm })) },
                  ].map(({ field, label, show, toggle }) => (
                    <div key={field} className="space-y-1.5">
                      <Label className="text-sm font-medium">{label} *</Label>
                      <div className="relative">
                        <Input
                          type={show ? 'text' : 'password'}
                          required
                          minLength={field === 'current' ? 1 : 8}
                          value={pwForm[field as keyof typeof pwForm]}
                          onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                          className="pr-10 h-11"
                          placeholder={field === 'current' ? '••••••••' : 'Mínimo 8 caracteres'}
                        />
                        <button
                          type="button"
                          onClick={toggle}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}

                  {pwError && (
                    <p className="text-destructive text-sm bg-destructive/8 border border-destructive/20 px-3 py-2 rounded-lg">
                      {pwError}
                    </p>
                  )}
                  {pwSuccess && (
                    <p className="text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {pwSuccess}
                    </p>
                  )}

                  <Button type="submit" disabled={pwSaving} className="w-full h-11 rounded-xl">
                    {pwSaving ? 'Guardando...' : 'Actualizar contraseña'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
