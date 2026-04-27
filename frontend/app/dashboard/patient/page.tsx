'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { addressesApi, usersApi, type PatientAddress } from '@/lib/api';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  CalendarCheck,
  Clock,
  BarChart3,
  Plus,
  ArrowRight,
  Leaf,
  MapPin,
  Trash2,
  Home,
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function PatientDashboard() {
  const { user } = useAuth();

  // Addresses
  const [addresses, setAddresses] = useState<PatientAddress[]>([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [addrForm, setAddrForm] = useState({ label: '', address: '' });
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrError, setAddrError] = useState('');
  const [addrSuccess, setAddrSuccess] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showAddrForm, setShowAddrForm] = useState(false);

  // Password change state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwShow, setPwShow] = useState({ current: false, next: false, confirm: false });

  useEffect(() => {
    addressesApi
      .list()
      .then(setAddresses)
      .catch(() => setAddresses([]))
      .finally(() => setAddrLoading(false));
  }, []);

  async function handleAddAddress(e: React.SyntheticEvent) {
    e.preventDefault();
    setAddrError('');
    setAddrSaving(true);
    try {
      const created = await addressesApi.add(addrForm);
      setAddresses((prev) => [...prev, created]);
      setAddrForm({ label: '', address: '' });
      setShowAddrForm(false);
      setAddrSuccess('Dirección guardada');
      setTimeout(() => setAddrSuccess(''), 3000);
    } catch (err: unknown) {
      setAddrError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setAddrSaving(false);
    }
  }

  async function handleDeleteAddress(id: number) {
    setDeletingId(id);
    try {
      await addressesApi.remove(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // silently ignore — address stays in list
    } finally {
      setDeletingId(null);
    }
  }

  async function handleChangePassword(e: React.SyntheticEvent) {
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

      {/* Addresses */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Mis direcciones
          </h2>
          <button
            onClick={() => { setShowAddrForm((v) => !v); setAddrError(''); }}
            className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
          >
            {showAddrForm ? <><X className="w-3.5 h-3.5" /> Cancelar</> : <><Plus className="w-3.5 h-3.5" /> Agregar</>}
          </button>
        </div>

        {addrSuccess && (
          <p className="text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg mb-4 flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5" /> {addrSuccess}
          </p>
        )}

        {showAddrForm && (
          <form onSubmit={handleAddAddress} className="bg-muted/40 rounded-xl border border-border p-4 mb-5 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Etiqueta *</Label>
                <Input
                  required
                  value={addrForm.label}
                  onChange={(e) => setAddrForm((p) => ({ ...p, label: e.target.value }))}
                  placeholder="Ej: Casa, Trabajo"
                  className="h-10 bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Dirección *</Label>
                <Input
                  required
                  value={addrForm.address}
                  onChange={(e) => setAddrForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Ej: Av. Corrientes 1234, CABA"
                  className="h-10 bg-white"
                />
              </div>
            </div>
            {addrError && (
              <p className="text-destructive text-sm">{addrError}</p>
            )}
            <Button type="submit" disabled={addrSaving} size="sm" className="rounded-lg">
              {addrSaving ? 'Guardando...' : 'Guardar dirección'}
            </Button>
          </form>
        )}

        {addrLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
            <Home className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No tenés direcciones guardadas</p>
            <button
              onClick={() => setShowAddrForm(true)}
              className="text-primary text-sm font-medium hover:underline mt-1"
            >
              Agregar una ahora
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {addresses.map((addr) => (
              <li
                key={addr.id}
                className="flex items-center justify-between gap-3 p-4 rounded-xl bg-muted/40 border border-border"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{addr.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{addr.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  disabled={deletingId === addr.id}
                  className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors disabled:opacity-40"
                  aria-label="Eliminar dirección"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          Cambiar contraseña
        </h2>

        <form onSubmit={handleChangePassword} className="grid sm:grid-cols-3 gap-4">
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

          <div className="sm:col-span-3 space-y-3">
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
            <Button type="submit" disabled={pwSaving} className="rounded-xl h-11 px-6">
              {pwSaving ? 'Guardando...' : 'Actualizar contraseña'}
            </Button>
          </div>
        </form>
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
