import Link from 'next/link';
import { servicesApi, type Service } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import {
  Search,
  ArrowRight,
  CheckCircle2,
  Leaf,
  ShieldCheck,
  Syringe,
  Wind,
  Ear,
  Sparkles,
  Footprints,
  Flame,
  HandHeart,
  CalendarDays,
  Activity,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
} from 'lucide-react';

type CatalogStyle = { Icon: LucideIcon; bg: string; iconColor: string };

const STYLES: CatalogStyle[] = [
  { Icon: Syringe,    bg: 'bg-teal-50',    iconColor: 'text-teal-600'   },
  { Icon: Wind,       bg: 'bg-sky-50',     iconColor: 'text-sky-600'    },
  { Icon: Ear,        bg: 'bg-purple-50',  iconColor: 'text-purple-600' },
  { Icon: Sparkles,   bg: 'bg-amber-50',   iconColor: 'text-amber-600'  },
  { Icon: Footprints, bg: 'bg-green-50',   iconColor: 'text-green-600'  },
  { Icon: Flame,      bg: 'bg-orange-50',  iconColor: 'text-orange-600' },
  { Icon: Leaf,       bg: 'bg-emerald-50', iconColor: 'text-emerald-600'},
  { Icon: HandHeart,  bg: 'bg-rose-50',    iconColor: 'text-rose-600'   },
];

type CategoryItem = { label: string; Icon: LucideIcon };
const CATEGORIES: CategoryItem[] = [
  { label: 'Todo',       Icon: Activity  },
  { label: 'Acupuntura', Icon: Syringe   },
  { label: 'Ventosas',   Icon: Wind      },
  { label: 'Auricular',  Icon: Ear       },
  { label: 'Energética', Icon: Sparkles  },
  { label: 'Masajes',    Icon: HandHeart },
  { label: 'Plantas',    Icon: Leaf      },
];

// Mapeo pill label → término de búsqueda para el backend
const CATEGORY_SEARCH: Record<string, string> = {
  'Acupuntura': 'acupuntura',
  'Ventosas':   'ventosas',
  'Auricular':  'auricular',
  'Energética': 'reiki',
  'Masajes':    'masaje',
  'Plantas':    'fitoterapia',
};

async function fetchServices(page: number, search: string) {
  try {
    const data = await servicesApi.list(page, 6, search);
    return { items: data.content, totalPages: data.totalPages, currentPage: data.number };
  } catch {
    return { items: [] as Service[], totalPages: 0, currentPage: 0 };
  }
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const { page: pageParam, category } = await searchParams;
  const currentPage = Math.max(0, parseInt(pageParam ?? '0', 10) || 0);
  const search = category ? (CATEGORY_SEARCH[category] ?? category) : '';
  const { items, totalPages } = await fetchServices(currentPage, search);
  const validItems = items.filter((s) => s.professional?.id);

  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <section className="relative bg-linear-to-br from-primary via-primary/90 to-teal-800 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          <Badge
            variant="secondary"
            className="mb-6 bg-white/15 text-white border-white/20 hover:bg-white/20 text-xs px-4 py-1.5"
          >
            <Leaf className="w-3 h-3 mr-1.5" />
            Bienestar natural y profesional
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Tu bienestar,{' '}
            <span className="text-teal-200">sin complicaciones</span>
          </h1>

          <p className="text-teal-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Agendá sesiones de acupuntura, ventosas, auriculoterapia y más con
            los mejores profesionales. Fácil, rápido y sin turnos telefónicos.
          </p>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-2xl shadow-2xl p-1.5 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-3 pl-4">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="¿Qué terapia buscás?"
                  className="w-full py-3 text-foreground placeholder:text-muted-foreground text-sm outline-none bg-transparent"
                />
              </div>
              <Link
                href="/register"
                className={cn(buttonVariants({ size: 'lg' }), 'rounded-xl px-6 shrink-0')}
              >
                Buscar
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-teal-200">
            {['+500 sesiones realizadas', 'Profesionales certificados', 'Confirmación por email'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-300" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY PILLS ── */}
      <section className="border-b border-border bg-white sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-3 overflow-x-auto [scrollbar-width:none]">
            {CATEGORIES.map(({ label, Icon }) => {
              const isActive = label === 'Todo' ? !category : category === label;
              const href = label === 'Todo' ? '/?page=0' : `/?category=${encodeURIComponent(label)}&page=0`;
              return (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    'shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm whitespace-nowrap transition-colors',
                    isActive
                      ? 'border-foreground text-foreground font-medium bg-foreground/5'
                      : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SERVICE GRID ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {validItems.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No hay servicios disponibles aún</h3>
            <p className="text-muted-foreground text-sm">
              Pronto se publicarán nuevos servicios con sus profesionales.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {validItems.map((service, i) => {
                const style = STYLES[i % STYLES.length];
                const { Icon } = style;
                const bookHref = `/book/${service.professional!.id}`;
                return (
                  <div
                    key={service.id}
                    className="group flex flex-col rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md transition-shadow duration-300"
                  >
                    <div
                      className={cn(
                        'relative flex items-center justify-center h-44 transition-transform group-hover:scale-[1.02] duration-300',
                        style.bg
                      )}
                    >
                      <Icon className={cn('w-16 h-16', style.iconColor)} strokeWidth={1.25} />
                      {i === 0 && currentPage === 0 && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white text-foreground text-xs font-semibold shadow-sm border-0">
                            Más popular
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 p-5 gap-3">
                      <div>
                        <h3 className="font-semibold text-foreground text-base leading-tight mb-1">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                            {service.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 bg-muted/50 rounded-xl px-3 py-2.5">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {service.professional?.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground leading-none mb-0.5">Profesional a cargo</p>
                          <p className="text-sm font-semibold text-foreground truncate">
                            {service.professional?.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm font-semibold text-foreground">
                          ${Number(service.price).toLocaleString()}
                          <span className="font-normal text-muted-foreground"> / sesión</span>
                        </span>
                      </div>

                      <Link
                        href={bookHref}
                        className={cn(
                          buttonVariants({ size: 'sm' }),
                          'w-full rounded-xl text-xs font-semibold mt-1'
                        )}
                      >
                        <CalendarCheck className="w-3.5 h-3.5 mr-1.5" />
                        Reservar una cita ahora
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── PAGINATOR ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {currentPage > 0 ? (
                  <Link
                    href={`?${new URLSearchParams({ ...(category ? { category } : {}), page: String(currentPage - 1) })}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-lg gap-1')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Link>
                ) : (
                  <span className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-lg gap-1 opacity-40 pointer-events-none')}>
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Link
                      key={i}
                      href={`?${new URLSearchParams({ ...(category ? { category } : {}), page: String(i) })}`}
                      className={cn(
                        buttonVariants({ variant: i === currentPage ? 'default' : 'outline', size: 'sm' }),
                        'rounded-lg w-9 h-9 p-0'
                      )}
                    >
                      {i + 1}
                    </Link>
                  ))}
                </div>

                {currentPage < totalPages - 1 ? (
                  <Link
                    href={`?${new URLSearchParams({ ...(category ? { category } : {}), page: String(currentPage + 1) })}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-lg gap-1')}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-lg gap-1 opacity-40 pointer-events-none')}>
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-muted/50 border-y border-border py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-3">¿Cómo funciona?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Agendá tu sesión en minutos, como usuario registrado o como invitado
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-10">
            {[
              { Icon: Search,      step: '01', title: 'Explorá los servicios',  desc: 'Encontrá el tratamiento que necesitás entre nuestra variedad de terapias alternativas.' },
              { Icon: CalendarDays,step: '02', title: 'Elegí fecha y horario',  desc: 'Consultá la disponibilidad del profesional y seleccioná el turno que mejor te quede.' },
              { Icon: ShieldCheck, step: '03', title: 'Recibí confirmación',    desc: 'Te llega un email con todos los detalles de tu cita. Sin sorpresas.' },
            ].map(({ Icon, step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div className="w-20 h-20 bg-white border border-border rounded-2xl flex items-center justify-center shadow-sm text-primary">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-xs font-bold bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="py-20 px-4 text-center bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Empezá tu camino hacia el bienestar
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Registrate gratis en menos de 2 minutos, o agendá directamente como
            invitado sin crear una cuenta.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className={cn(buttonVariants({ size: 'lg' }), 'rounded-full px-8')}>
              Crear cuenta gratis
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link href="/login" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'rounded-full px-8')}>
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
