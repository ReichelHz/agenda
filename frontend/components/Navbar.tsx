'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { AvatarFallback, Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Leaf,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    setDropdownOpen(false);
    setMobileOpen(false);
    await logout();
    router.push('/');
  }

  const dashboardHref =
    user?.role === 'PROFESSIONAL' ? '/dashboard/professional' : '/dashboard/patient';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border/60 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary/90 transition-colors">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-foreground tracking-tight leading-tight">
              Stefani <span className="text-primary">Leiva</span>
            </span>
            <small className="text-xs text-muted-foreground font-normal">
              Terapias Alternativas
            </small>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            /* ── Logged-in: dropdown (same for mobile + desktop) ── */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors"
              >
                <Avatar className="w-7 h-7 rounded-full shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground max-w-28 truncate hidden sm:block">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-muted-foreground transition-transform duration-200',
                    dropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-border rounded-2xl shadow-lg py-1.5 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-2.5 border-b border-border mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>

                  {/* Explorar */}
                  <Link
                    href="/"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Search className="w-4 h-4 text-muted-foreground" />
                    Explorar
                  </Link>

                  {/* Mi panel (todos los roles) */}
                  <Link
                    href={dashboardHref}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                    Mi panel
                  </Link>

                  {/* Divider + logout */}
                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-destructive hover:bg-destructive/8 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* ── Not logged-in: desktop buttons ── */}
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                  Iniciar sesión
                </Link>
                <Link href="/register" className={cn(buttonVariants({ size: 'sm' }), 'rounded-full px-4')}>
                  Registrarse
                </Link>
              </div>

              {/* ── Not logged-in: mobile hamburger ── */}
              <button
                className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu (only for non-logged-in) */}
      {!user && mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 flex flex-col gap-3">
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
        </div>
      )}
    </header>
  );
}
