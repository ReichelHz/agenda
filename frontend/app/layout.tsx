import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { Leaf } from 'lucide-react';

const GeistSans = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'TerapiasVida — Agenda de Terapias Alternativas',
  description:
    'Conectamos pacientes con profesionales de acupuntura, ventosas, auriculoterapia y más.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={GeistSans.variable}>
      <body className="min-h-screen flex flex-col bg-background">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <div className="grid sm:grid-cols-3 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-3">
                    TerapiasVida
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Conectamos pacientes con profesionales de terapias alternativas para un bienestar integral.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-3">
                    Terapias
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Acupuntura</li>
                    <li>Ventosas</li>
                    <li>Auriculoterapia</li>
                    <li>Reiki & más</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-3">
                    Plataforma
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Para profesionales</li>
                    <li>Para pacientes</li>
                    <li>Agenda online</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  © 2026 TerapiasVida. Todos los derechos reservados.
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  Bienestar natural para todos
                  <Leaf className="w-3.5 h-3.5 text-primary" />
                </p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
