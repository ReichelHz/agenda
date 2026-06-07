'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  availabilitiesApi,
  servicesApi,
  professionalApi,
  appointmentsApi,
  usersApi,
  type Availability,
  type Service,
  type ServiceModality,
  type ProfessionalProfile,
  type Appointment,
  type AppointmentStatus,
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
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
  CalendarCheck,
  Ban,
  Mail,
  MapPin,
  Video,
} from 'lucide-react';

export default function ProfessionalDashboard() {
  const { user } = useAuth();

  // Availability state
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [avLoading, setAvLoading] = useState(true);

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptLoading, setApptLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [apptToDelete, setApptToDelete] = useState<Appointment | null>(null);
  const [deletingAppt, setDeletingAppt] = useState(false);

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [svLoading, setSvLoading] = useState(true);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState(false);
  const [svForm, setSvForm] = useState({ name: '', description: '', price: '', duration: '', modality: 'PRESENCIAL' as ServiceModality });
  const [svDurationMode, setSvDurationMode] = useState<'preset' | 'custom'>('preset');
  const [svSaving, setSvSaving] = useState(false);
  const [svError, setSvError] = useState('');
  const [svSuccess, setSvSuccess] = useState('');

  // Availability slots staged during service creation
  const [svAvSlots, setSvAvSlots] = useState<{ dayOfWeek: DayOfWeek; startTime: string; endTime: string }[]>([]);
  const [svAvForm, setSvAvForm] = useState<{ startTime: string; endTime: string }>({
    startTime: '09:00',
    endTime: '17:00',
  });
  const [svAvSelectedDay, setSvAvSelectedDay] = useState<DayOfWeek>('MONDAY');

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
    if (!user) return;
    appointmentsApi
      .professionalAppointments()
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch(() => setAppointments([]))
      .finally(() => setApptLoading(false));
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
      // Create staged availability slots
      for (const slot of svAvSlots) {
        try {
          const av = await availabilitiesApi.create({
            professional: { id: user.id },
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime + ':00',
            endTime: slot.endTime + ':00',
          });
          setAvailabilities((prev) => [...prev, av]);
        } catch {
          // non-blocking: availability errors don't fail the whole operation
        }
      }
      setSvForm({ name: '', description: '', price: '', duration: '', modality: 'PRESENCIAL' });
      setSvDurationMode('preset');
      setSvAvSlots([]);
      setSvAvForm({ startTime: '09:00', endTime: '17:00' });
      setSvAvSelectedDay('MONDAY');
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
      setSvError('No se pudo eliminar el horario');
      setTimeout(() => setSvError(''), 4000);
    }
  }

  async function handleDeleteService() {
    if (!serviceToDelete) return;
    setDeletingService(true);
    try {
      await servicesApi.delete(serviceToDelete.id);
      setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
      setServiceToDelete(null);
    } catch {
      setSvError('No se pudo eliminar el servicio');
      setTimeout(() => setSvError(''), 4000);
    } finally {
      setDeletingService(false);
    }
  }

  async function handleConfirmAppt(appt: Appointment) {
    setConfirmingId(appt.id);
    try {
      const updated = await appointmentsApi.updateStatusAdmin(appt.id, 'CONFIRMED');
      setAppointments((prev) => prev.map((a) => (a.id === appt.id ? updated : a)));
    } catch {
      // silently ignore
    } finally {
      setConfirmingId(null);
    }
  }

  async function handleCancelAppt(appt: Appointment) {
    setCancellingId(appt.id);
    try {
      const updated = await appointmentsApi.updateStatusAdmin(appt.id, 'CANCELLED');
      setAppointments((prev) => prev.map((a) => (a.id === appt.id ? updated : a)));
    } catch {
      // silently ignore
    } finally {
      setCancellingId(null);
    }
  }

  async function handleDeleteAppt() {
    if (!apptToDelete) return;
    setDeletingAppt(true);
    try {
      await appointmentsApi.deleteByProfessional(apptToDelete.id);
      setAppointments((prev) => prev.filter((a) => a.id !== apptToDelete.id));
      setApptToDelete(null);
    } catch {
      // silently ignore
    } finally {
      setDeletingAppt(false);
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

  function formatApptDate(dateStr: string) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  const STATUS_CONFIG: Record<AppointmentStatus, { label: string; className: string }> = {
    PENDING: { label: 'Pendiente', className: 'border-amber-300 text-amber-700 bg-amber-50' },
    CONFIRMED: { label: 'Confirmada', className: 'border-emerald-300 text-emerald-700 bg-emerald-50' },
    CANCELLED: { label: 'Cancelada', className: 'border-red-200 text-red-600 bg-red-50' },
  };

  const LOCATION_CONFIG: Record<string, { label: string; Icon: typeof MapPin }> = {
    OFFICE: { label: 'Consultorio', Icon: MapPin },
    HOME: { label: 'Domicilio', Icon: MapPin },
    VIRTUAL: { label: 'Virtual', Icon: Video },
  };

  const pendingAppts = appointments.filter((a) => a.status === 'PENDING').length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAppts = appointments.filter((a) => a.date === todayStr && a.status !== 'CANCELLED').length;

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
            Hola, <strong>{profile?.name ?? user?.name}</strong> — gestiona tus horarios y servicios
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
          { label: 'Citas pendientes', value: apptLoading ? '–' : pendingAppts, icon: <CalendarCheck className="w-4 h-4" /> },
          { label: 'Servicios', value: services.length, icon: <Scissors className="w-4 h-4" /> },
          { label: 'Reservas hoy', value: apptLoading ? '–' : todayAppts, icon: <Clock className="w-4 h-4" /> },
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
      <Tabs defaultValue="appointments">
        <TabsList variant="line" className="mb-6 w-full border-b border-border rounded-none pb-0">
          <TabsTrigger value="appointments" className="gap-2 pb-3">
            <CalendarCheck className="w-4 h-4" />
            Citas
            {pendingAppts > 0 && (
              <span className="ml-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                {pendingAppts}
              </span>
            )}
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

        {/* ── Appointments manager ── */}
        <TabsContent value="appointments">
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" />
              Administrador de citas
              {appointments.length > 0 && (
                <span className="ml-auto text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {appointments.length}
                </span>
              )}
            </h2>

            {apptLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-14 border-2 border-dashed border-border rounded-2xl">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CalendarCheck className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No tienes citas todavía</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Cuando un paciente reserve un turno contigo, aparecerá aquí.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full min-w-160 text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Paciente</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap">Servicio</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap">Fecha</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap">Hora</th>
                      <th className="text-left font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap">Estado</th>
                      <th className="text-right font-medium text-muted-foreground px-3 py-2.5">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {appointments.map((appt) => {
                      const cfg = STATUS_CONFIG[appt.status];
                      const loc = appt.locationType ? LOCATION_CONFIG[appt.locationType] : null;
                      return (
                        <tr key={appt.id} className="hover:bg-muted/30 transition-colors align-top">
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-2 ring-primary/15">
                                <span className="text-[11px] font-bold text-primary">
                                  {appt.patientName
                                    ?.split(' ')
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate">{appt.patientName}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  {appt.patientEmail}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-foreground whitespace-nowrap">
                            {appt.serviceName}
                            {loc && (
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                                <loc.Icon className="w-3 h-3" />
                                {loc.label}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-foreground whitespace-nowrap">{formatApptDate(appt.date)}</td>
                          <td className="px-3 py-3 text-foreground whitespace-nowrap">{appt.time.slice(0, 5)}</td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <Badge variant="outline" className={cn('text-xs font-medium', cfg.className)}>
                              {cfg.label}
                            </Badge>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-3">
                              {appt.status === 'PENDING' && (
                                <button
                                  onClick={() => handleConfirmAppt(appt)}
                                  disabled={confirmingId === appt.id}
                                  className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-40"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {confirmingId === appt.id ? 'Confirmando…' : 'Confirmar'}
                                </button>
                              )}
                              {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                                <button
                                  onClick={() => handleCancelAppt(appt)}
                                  disabled={cancellingId === appt.id}
                                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-600 transition-colors disabled:opacity-40"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  {cancellingId === appt.id ? 'Cancelando…' : 'Cancelar'}
                                </button>
                              )}
                              <button
                                onClick={() => setApptToDelete(appt)}
                                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Precio *</Label>
                    <span className="text-xs text-muted-foreground">por sesión</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">$</span>
                    <Input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={svForm.price}
                      onChange={(e) => setSvForm((p) => ({ ...p, price: e.target.value }))}
                      placeholder="5000"
                      className="pl-7 h-11 font-medium"
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

                {/* ── Disponibilidad horaria ── */}
                <div className="border-t border-border/60 pt-4 mt-1">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-medium text-foreground">Disponibilidad horaria</span>
                    <span className="text-xs text-muted-foreground">(opcional)</span>
                  </div>

                  {/* Day pills */}
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {DAYS_ORDER.map((day) => {
                      const hasSlots = svAvSlots.some((s) => s.dayOfWeek === day);
                      const isSelected = svAvSelectedDay === day;
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setSvAvSelectedDay(day)}
                          className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                            isSelected
                              ? 'bg-primary text-white shadow-sm'
                              : hasSlots
                              ? 'bg-primary/12 text-primary border border-primary/25'
                              : 'bg-muted text-muted-foreground hover:bg-muted/70'
                          }`}
                        >
                          {DAY_LABELS[day].slice(0, 2)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Time inputs for selected day */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-muted-foreground w-8 shrink-0">
                      {DAY_LABELS[svAvSelectedDay].slice(0, 3)}
                    </span>
                    <Input
                      type="time"
                      value={svAvForm.startTime}
                      onChange={(e) => setSvAvForm((p) => ({ ...p, startTime: e.target.value }))}
                      className="h-9 flex-1 text-sm"
                    />
                    <span className="text-muted-foreground text-xs">–</span>
                    <Input
                      type="time"
                      value={svAvForm.endTime}
                      onChange={(e) => setSvAvForm((p) => ({ ...p, endTime: e.target.value }))}
                      className="h-9 flex-1 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 shrink-0"
                      onClick={() => {
                        if (!svAvForm.startTime || !svAvForm.endTime) return;
                        setSvAvSlots((prev) => [
                          ...prev,
                          { dayOfWeek: svAvSelectedDay, startTime: svAvForm.startTime, endTime: svAvForm.endTime },
                        ]);
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Staged slots grouped by day */}
                  {svAvSlots.length > 0 && (
                    <div className="space-y-1.5 bg-muted/40 rounded-xl px-3 py-2.5">
                      {DAYS_ORDER.filter((d) => svAvSlots.some((s) => s.dayOfWeek === d)).map((day) => (
                        <div key={day} className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-muted-foreground w-8 shrink-0">
                            {DAY_LABELS[day].slice(0, 3)}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {svAvSlots
                              .map((slot, i) => ({ slot, i }))
                              .filter(({ slot }) => slot.dayOfWeek === day)
                              .map(({ slot, i }) => (
                                <span
                                  key={i}
                                  className="flex items-center gap-1 text-[11px] bg-primary/8 text-primary border border-primary/20 rounded-md pl-2 pr-1 py-0.5 font-medium"
                                >
                                  {slot.startTime} – {slot.endTime}
                                  <button
                                    type="button"
                                    onClick={() => setSvAvSlots((prev) => prev.filter((_, j) => j !== i))}
                                    className="ml-0.5 text-primary/50 hover:text-destructive transition-colors"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </span>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

                <Button type="submit" disabled={svSaving} className="w-full h-12 rounded-xl font-semibold gap-2 text-sm shadow-sm shadow-primary/20">
                  {svSaving ? 'Guardando...' : (
                    <>
                      <Plus className="w-4 h-4" />
                      Crear servicio
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Right column: services list + current availability */}
            <div className="space-y-6">
            {/* Services list */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-primary" />
                Servicios activos
                {services.length > 0 && (
                  <span className="ml-auto text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {services.length}
                  </span>
                )}
              </h2>

              {svLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-muted/60 rounded-2xl flex items-center justify-center mx-auto mb-3 ring-1 ring-border/50">
                    <Scissors className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-foreground/70 mb-1">Sin servicios aún</p>
                  <p className="text-xs text-muted-foreground">Creá tu primer servicio desde el formulario de la izquierda</p>
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
                      /* Service card */
                      <div
                        key={sv.id}
                        className="group relative rounded-2xl border border-border/70 bg-white hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)] hover:border-border hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                      >
                        {/* Top modality color bar */}
                        <div
                          className={`h-[3px] w-full ${
                            sv.modality === 'VIRTUAL'
                              ? 'bg-gradient-to-r from-blue-400 to-sky-500'
                              : sv.modality === 'AMBAS'
                              ? 'bg-gradient-to-r from-violet-400 to-purple-500'
                              : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                          }`}
                        />

                        <div className="px-4 pt-4 pb-3.5">
                          {/* Title + modality badge */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="font-bold text-sm text-foreground leading-snug line-clamp-2 flex-1">
                              {sv.name}
                            </p>
                            <span
                              className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${modalityBadge(sv.modality)}`}
                            >
                              {modalityText(sv.modality)}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-[13px] text-muted-foreground/80 leading-relaxed line-clamp-2 mb-3.5">
                            {sv.description}
                          </p>

                          {/* Footer row */}
                          <div className="flex items-center justify-between pt-3 border-t border-border/40">
                            {/* Duration pill */}
                            {sv.durationMinutes ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/70 px-2.5 py-1 rounded-full">
                                <Clock className="w-3 h-3" />
                                {durationLabel(sv.durationMinutes)}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground/30 italic">Sin duración</span>
                            )}

                            {/* Price + actions */}
                            <div className="flex items-center gap-3">
                              {/* Price block */}
                              <div className="text-right">
                                <div className="font-bold text-foreground text-lg leading-none">
                                  ${sv.price.toLocaleString()}
                                </div>
                                <div className="text-muted-foreground text-[10px] mt-0.5 tracking-wide uppercase font-medium">
                                  por sesión
                                </div>
                              </div>
                              {/* Action buttons */}
                              <div className="flex items-center gap-0.5 pl-3 border-l border-border/50">
                                <button
                                  type="button"
                                  onClick={() => startEditService(sv)}
                                  className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors"
                                  title="Editar servicio"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setServiceToDelete(sv)}
                                  className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                  title="Eliminar servicio"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Current availability */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                Horarios actuales
              </h2>
              {avLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : activeDays.length === 0 ? (
                <div className="text-center py-6">
                  <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Sin horarios cargados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeDays.map((day) => (
                    <div key={day} className="flex items-start gap-2.5">
                      <Badge variant="secondary" className="text-[10px] w-14 justify-center shrink-0 mt-0.5">
                        {DAY_LABELS[day].slice(0, 3)}
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {byDay[day].map((av) => (
                          <span
                            key={av.id}
                            className="group flex items-center gap-1 text-[11px] bg-primary/8 text-primary border border-primary/20 rounded-md pl-2 pr-1 py-0.5 font-medium"
                          >
                            {av.startTime.slice(0, 5)} – {av.endTime.slice(0, 5)}
                            <button
                              type="button"
                              onClick={() => handleDeleteAvailability(av.id)}
                              className="opacity-0 group-hover:opacity-100 ml-0.5 text-primary/50 hover:text-destructive transition-all"
                              title="Eliminar horario"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            </div>{/* end right column */}
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
                      placeholder="Cuenta brevemente tu especialidad, formación o enfoque..."
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
                  Comparte este enlace para que tus pacientes reserven en línea
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

      {/* Confirm: delete appointment */}
      <ConfirmDialog
        open={apptToDelete !== null}
        onOpenChange={(o) => !o && setApptToDelete(null)}
        title="¿Eliminar esta cita?"
        description={
          apptToDelete ? (
            <>
              Se eliminará permanentemente la cita de{' '}
              <strong className="text-foreground">{apptToDelete.patientName}</strong> del{' '}
              {formatApptDate(apptToDelete.date)} a las {apptToDelete.time.slice(0, 5)}. Esta acción no se puede deshacer.
            </>
          ) : null
        }
        loading={deletingAppt}
        onConfirm={handleDeleteAppt}
      />

      {/* Confirm: delete service */}
      <ConfirmDialog
        open={serviceToDelete !== null}
        onOpenChange={(o) => !o && setServiceToDelete(null)}
        title="¿Eliminar este servicio?"
        description={
          serviceToDelete ? (
            <>
              Se eliminará el servicio{' '}
              <strong className="text-foreground">{serviceToDelete.name}</strong>. Esta acción no se puede deshacer.
            </>
          ) : null
        }
        loading={deletingService}
        onConfirm={handleDeleteService}
      />
    </div>
  );
}
