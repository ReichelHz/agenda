'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Stethoscope, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'PROFESSIONAL') {
      router.replace('/dashboard/professional');
    } else if (user?.role === 'PATIENT') {
      router.replace('/dashboard/patient');
    }
  }, [user, router]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Hola, {user?.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          {user?.role === 'PROFESSIONAL'
            ? 'Panel de profesional'
            : user?.role === 'ADMIN'
            ? 'Panel de administrador'
            : 'Panel de paciente'}
        </p>
      </div>

      {user?.role === 'ADMIN' && (
        <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
          <Link
            href="/dashboard/professional"
            className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Profesionales</h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                Gestionar disponibilidades y servicios
              </p>
            </div>
          </Link>
          <Link
            href="/dashboard/patient"
            className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Pacientes</h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                Ver y gestionar citas
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
