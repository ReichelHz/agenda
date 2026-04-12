const API_BASE =
  typeof window === 'undefined'
    ? (process.env.BACKEND_URL ?? 'http://localhost:8081')
    : '';

const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
  const text = await res.text();
  let message = text;

  try {
    const json = JSON.parse(text);
    message = json.error || text;
  } catch {
    // no era JSON válido, usamos text directamente
  }

  throw new Error(message);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    name: string;
    email: string;
    password: string;
    role: 'PATIENT' | 'PROFESSIONAL';
    phone?: string;
    birthDate?: string;
  }) =>
    request<{ id: number; name: string; email: string; role: string }>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  logout: () =>
    request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
};

// Users
export const usersApi = {
  me: () =>
    request<{ id: number; name: string; email: string; role: string }>(
      '/api/users/me'
    ),
};

// Services
export type Service = {
  id: number;
  name: string;
  description?: string;
  price: number;
  durationMinutes?: number;
  professional?: { id: number; name: string } | null;
};

export type PagedResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

export const servicesApi = {
  list: (page = 0, size = 6, search = '') => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (search) params.set('search', search);
    return request<PagedResponse<Service>>(`/api/services?${params}`);
  },
  byProfessional: (id: number) =>
    request<Service[]>(`/api/services/professional/${id}`),
  create: (data: { name: string; description: string; price: number; durationMinutes?: number; professional?: { id: number } }) =>
    request<Service>('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Availabilities
export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export type Availability = {
  id: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
};

export const availabilitiesApi = {
  byProfessional: (id: number) =>
    request<Availability[]>(`/api/availabilities/professional/${id}`),
  create: (data: {
    professional: { id: number };
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
  }) =>
    request<Availability>('/api/availabilities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Appointments
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export type Appointment = {
  id: number;
  professionalId: number;
  patientName: string;
  patientEmail: string;
  serviceId: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
};

export const appointmentsApi = {
  create: (data: {
    professionalId: number;
    patientName: string;
    patientEmail: string;
    serviceId: number;
    date: string;
    time: string;
    notes?: string;
  }) =>
    request<Appointment>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  myAppointments: () => request<Appointment[]>('/api/appointments/me'),
  cancel: (id: number) =>
    request<Appointment>(`/api/appointments/${id}/cancel`, { method: 'PATCH' }),
};

// Short URLs
export const urlsApi = {
  list: () =>
    request<
      {
        id: number;
        shortCode: string;
        shortUrl: string;
        originalUrl: string;
        clickCount: number;
        createdAt: string;
      }[]
    >('/api/urls'),
  create: (data: { originalUrl: string; customAlias?: string }) =>
    request('/api/urls', { method: 'POST', body: JSON.stringify(data) }),
};

// Days of week display
export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

export const DAYS_ORDER: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];
