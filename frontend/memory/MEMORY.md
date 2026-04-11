# TerapiasVida Frontend — Memoria del Proyecto

## Stack
- Next.js 16.2.3 (App Router, Turbopack)
- React 19.2.4
- TypeScript 5
- Tailwind CSS v4 (sintaxis: `@import "tailwindcss"` en globals.css)
- Backend: Spring Boot en `http://localhost:8081`

## Estructura de archivos clave
- `lib/api.ts` — cliente fetch para todas las APIs del backend
- `lib/auth-context.tsx` — AuthProvider + useAuth hook (client component)
- `components/Navbar.tsx` — Barra de navegación
- `app/layout.tsx` — Layout raíz con AuthProvider + Navbar
- `app/page.tsx` — Landing page (server component, fetch servicios)
- `app/login/page.tsx` — Login
- `app/register/page.tsx` — Register con selector de rol
- `app/dashboard/layout.tsx` — Guard de autenticación
- `app/dashboard/page.tsx` — Redirige según rol
- `app/dashboard/professional/page.tsx` — Panel profesional (disponibilidad + servicios)
- `app/dashboard/patient/page.tsx` — Panel paciente
- `app/book/[professionalId]/page.tsx` — Reserva pública (sin login requerido)

## APIs del backend disponibles
- POST `/api/auth/register` — { name, email, password, role, phone?, birthDate? }
- POST `/api/auth/login` — { email, password } → { token }
- GET `/api/users/me` — perfil autenticado
- GET `/api/services` — servicios (público)
- POST `/api/services` — crear servicio (protegido)
- GET `/api/availabilities/professional/{id}` — disponibilidad (público)
- POST `/api/availabilities` — crear disponibilidad (protegido)
- POST `/api/appointments` — PENDIENTE en backend (UI lista)

## Roles disponibles
- `PATIENT` — panel paciente, puede agendar
- `PROFESSIONAL` — panel profesional, gestiona disponibilidad/servicios
- `ADMIN` — acceso a ambos paneles

## Shadcn/UI (Base UI version)
- shadcn usa `@base-ui/react/*` en vez de `@radix-ui/react/*`
- **NO existe `asChild` prop** — para botones con links usar `buttonVariants` + `<Link>`:
  ```tsx
  import { buttonVariants } from '@/components/ui/button'
  <Link href="/" className={cn(buttonVariants({ size: 'lg' }), 'extra-class')} />
  ```
- Tabs API: `<Tabs defaultValue="x">` + `<TabsTrigger value="x">` + `<TabsContent value="x">`
- Select complejo — mejor usar `<select>` nativo estilizado con clases border/h-11/etc
- Avatar necesita `<Avatar>` + `<AvatarFallback>` children

## Tailwind v4 cambios clave
- `bg-gradient-to-br` → `bg-linear-to-br`
- No tailwind.config.js — configuración en globals.css con `@theme inline`
- `[scrollbar-width:none]` para ocultar scrollbars

## React 19 cambios clave
- `FormEvent` deprecated → usar `React.FormEvent<HTMLFormElement>`
- Params de rutas dinámicas son Promise → `use(params)` en client components

## Convenciones
- Server components pueden ser async y hacer fetch directo
- Client components necesitan `"use client"` al tope
- Icons: lucide-react (instalado)

## Color palette (Airbnb-inspired, wellness teal)
- Primary: oklch(0.56 0.13 185) ≈ teal-600
- Background: white puro
- Cards: white con border border-border
- Rounded: rounded-2xl para cards, rounded-xl para inputs/buttons
- Diseño inspirado en Airbnb: grilla de cards, categorías en pills, hero con search bar
