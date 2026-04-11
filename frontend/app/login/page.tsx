'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Leaf, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-primary to-teal-800 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />
        <div className="relative text-center text-white max-w-sm">
          <div className="w-20 h-20 bg-white/15 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Leaf className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Bienestar al alcance de todos
          </h2>
          <p className="text-teal-100 leading-relaxed mb-10">
            Conectamos pacientes con los mejores profesionales de terapias
            alternativas de forma simple y segura.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { n: '500+', label: 'Sesiones realizadas' },
              { n: '4.9★', label: 'Calificación promedio' },
              { n: '24/7', label: 'Reservas online' },
              { n: '100%', label: 'Profesionales verificados' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4">
                <div className="text-xl font-bold text-white">{s.n}</div>
                <div className="text-xs text-teal-200 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
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
            <h1 className="text-2xl font-bold text-foreground">
              Bienvenido de vuelta
            </h1>
            <p className="text-muted-foreground mt-1.5">
              Iniciá sesión para gestionar tus citas
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
              className="w-full h-11 rounded-xl text-sm font-semibold"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="text-xs text-muted-foreground bg-background px-3">
                ¿No tenés cuenta?
              </span>
            </div>
          </div>

          <Link
            href="/register"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center'
            )}
          >
            Registrarse gratis
          </Link>
        </div>
      </div>
    </div>
  );
}
