'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Leaf,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  AlertCircle,
  Stethoscope,
  HeartHandshake,
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const defaultRole =
    (searchParams.get('role') as 'PATIENT' | 'PROFESSIONAL') || 'PATIENT';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    birthDate: '',
    role: defaultRole,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function handleSubmit(e: React.ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role as 'PATIENT' | 'PROFESSIONAL',
        phone: form.phone || undefined,
        birthDate: form.birthDate || undefined,
      });
      await login(form.email, form.password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'El mail ya está registrado');
    } finally {
      setLoading(false);
    }
  }

  const ROLES = [
    {
      value: 'PATIENT',
      label: 'Soy Paciente',
      sublabel: 'Quiero agendar sesiones',
      icon: <HeartHandshake className="w-6 h-6" />,
    },
    {
      value: 'PROFESSIONAL',
      label: 'Soy Profesional',
      sublabel: 'Ofrezco mis servicios',
      icon: <Stethoscope className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-start lg:items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo mobile */}
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">
            Terapias<span className="text-primary">Vida</span>
          </span>
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Creá tu cuenta</h1>
          <p className="text-muted-foreground mt-1.5">Gratis, en menos de 2 minutos</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-7">
          {ROLES.map((opt) => {
            const active = form.role === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('role', opt.value)}
                className={`flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${
                  active
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/40'
                }`}
              >
                <span className={`mb-2 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {opt.icon}
                </span>
                <span className="font-semibold text-sm text-foreground">{opt.label}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{opt.sublabel}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre completo *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Ana García"
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium">
                Teléfono
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="1123456789"
                  className="pl-9 h-11"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="ana@email.com"
                className="pl-9 h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="pl-9 h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="birthDate" className="text-sm font-medium">
              Fecha de nacimiento
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="birthDate"
                type="date"
                value={form.birthDate}
                onChange={(e) => set('birthDate', e.target.value)}
                className="pl-9 h-11"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-destructive/8 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl text-sm font-semibold mt-2"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
