import Link from 'next/link';
import { servicesApi, type Service } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import {
  Search,
  Star,
  ArrowRight,
  CheckCircle2,
  Leaf,
  CalendarCheck,
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
} from 'lucide-react';

async function getServices(): Promise<Service[]> {
  try {
    return await servicesApi.list();
  } catch {
    return [];
  }
}

type CatalogItem = {
  name: string;
  Icon: LucideIcon;
  tag?: string;
  desc: string;
  rating: number;
  reviews: number;
  price: number;
  bg: string;
  iconColor: string;
};

const CATALOG: CatalogItem[] = [
  {
    name: 'Acupuntura',
    Icon: Syringe,
    tag: 'Más popular',
    desc: 'Reequilibra tu energía vital mediante agujas en puntos estratégicos.',
    rating: 4.9,
    reviews: 128,
    price: 6500,
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    name: 'Ventosas',
    Icon: Wind,
    tag: 'Tendencia',
    desc: 'Terapia de succión que alivia tensiones musculares y mejora la circulación.',
    rating: 4.8,
    reviews: 94,
    price: 5000,
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    name: 'Auriculoterapia',
    Icon: Ear,
    desc: 'Estimulación de puntos reflejos en el pabellón auricular para tratar diversas dolencias.',
    rating: 4.7,
    reviews: 76,
    price: 4500,
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    name: 'Reiki',
    Icon: Sparkles,
    desc: 'Canalización de energía universal para promover la sanación y el bienestar.',
    rating: 4.9,
    reviews: 112,
    price: 5500,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    name: 'Reflexología',
    Icon: Footprints,
    desc: 'Masajes terapéuticos en pies y manos que conectan con órganos y sistemas del cuerpo.',
    rating: 4.8,
    reviews: 88,
    price: 4800,
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    name: 'Moxibustión',
    Icon: Flame,
    desc: 'Aplicación de calor medicinal con artemisa en puntos de acupuntura específicos.',
    rating: 4.7,
    reviews: 55,
    price: 5200,
    bg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    name: 'Fitoterapia',
    Icon: Leaf,
    desc: 'Tratamiento natural con plantas medicinales seleccionadas para tu bienestar.',
    rating: 4.6,
    reviews: 42,
    price: 3800,
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    name: 'Masajes Terapéuticos',
    Icon: HandHeart,
    desc: 'Alivio muscular profundo y relajación total con técnicas especializadas.',
    rating: 4.9,
    reviews: 201,
    price: 5800,
    bg: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
];

type CategoryItem = { label: string; Icon: LucideIcon };
const CATEGORIES: CategoryItem[] = [
  { label: 'Todo', Icon: Activity },
  { label: 'Acupuntura', Icon: Syringe },
  { label: 'Ventosas', Icon: Wind },
  { label: 'Auricular', Icon: Ear },
  { label: 'Energética', Icon: Sparkles },
  { label: 'Masajes', Icon: HandHeart },
  { label: 'Plantas', Icon: Leaf },
];

export default async function LandingPage() {
  const apiServices = await getServices();

  const items: CatalogItem[] =
    apiServices.length > 0
      ? apiServices.map((s: Service, i: number) => ({
          ...CATALOG[i % CATALOG.length],
          name: s.name,
          desc: s.description,
          price: s.price,
          tag: i === 0 ? 'Más popular' : undefined,
        }))
      : CATALOG;

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

          {/* Search bar */}
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

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-teal-200">
            {[
              '+500 sesiones realizadas',
              'Profesionales certificados',
              'Confirmación por email',
            ].map((t) => (
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
            {CATEGORIES.map(({ label, Icon }, i) => (
              <button
                key={label}
                className={cn(
                  'shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm whitespace-nowrap transition-colors',
                  i === 0
                    ? 'border-foreground text-foreground font-medium bg-foreground/5'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── THERAPY GRID ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const { Icon } = item;
            return (
              <div key={item.name} className="group cursor-pointer">
                {/* Card image area */}
                <div
                  className={cn(
                    'relative rounded-2xl h-52 flex items-center justify-center mb-3 overflow-hidden transition-transform group-hover:scale-[1.02] duration-300',
                    item.bg
                  )}
                >
                  <Icon className={cn('w-20 h-20', item.iconColor)} strokeWidth={1.25} />

                  {item.tag && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white text-foreground text-xs font-semibold shadow-sm border-0">
                        {item.tag}
                      </Badge>
                    </div>
                  )}

                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors group/heart">
                    <svg
                      className="w-4 h-4 text-foreground group-hover/heart:text-rose-500 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-foreground text-foreground" />
                      <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-snug line-clamp-2">
                    {item.desc}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.reviews} reseñas</p>
                  <p className="text-sm text-foreground pt-0.5">
                    <span className="font-semibold">${item.price.toLocaleString()}</span> / sesión
                  </p>
                </div>
              </div>
            );
          })}
        </div>
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
              {
                Icon: Search,
                step: '01',
                title: 'Explorá los servicios',
                desc: 'Encontrá el tratamiento que necesitás entre nuestra variedad de terapias alternativas.',
              },
              {
                Icon: CalendarDays,
                step: '02',
                title: 'Elegí fecha y horario',
                desc: 'Consultá la disponibilidad del profesional y seleccioná el turno que mejor te quede.',
              },
              {
                Icon: ShieldCheck,
                step: '03',
                title: 'Recibí confirmación',
                desc: 'Te llega un email con todos los detalles de tu cita. Sin sorpresas.',
              },
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
            <Link
              href="/register"
              className={cn(buttonVariants({ size: 'lg' }), 'rounded-full px-8')}
            >
              Crear cuenta gratis
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'rounded-full px-8')}
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
