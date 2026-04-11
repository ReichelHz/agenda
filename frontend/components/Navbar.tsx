'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { AvatarFallback, Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Leaf,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push('/');
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border/60 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary/90 transition-colors">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">
            Terapias<span className="text-primary">Vida</span>
          </span>
        </Link>

        {/* Center nav links (desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Explorar
          </Link>
          {user?.role === 'PROFESSIONAL' && (
            <Link
              href="/dashboard/professional"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Mi panel
            </Link>
          )}
          {user?.role === 'PATIENT' && (
            <Link
              href="/dashboard/patient"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Mis citas
            </Link>
          )}
        </div>

        {/* Right actions (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <div className="flex items-center gap-2 pr-2">
                <Avatar className="w-7 h-7 rounded-full shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground max-w-28 truncate">
                  {user.name.split(' ')[0]}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Panel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Salir
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'rounded-full px-4'
                )}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 flex flex-col gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="text-sm font-medium py-2"
                onClick={() => setMobileOpen(false)}
              >
                Mi panel
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium py-2 text-left text-destructive"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium py-2"
                onClick={() => setMobileOpen(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium py-2 text-primary"
                onClick={() => setMobileOpen(false)}
              >
                Crear cuenta gratis
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
