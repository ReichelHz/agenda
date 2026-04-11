async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(path, { ...options, headers });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `Error ${res.status}`);
  }

  const text = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (text ? JSON.parse(text) : null) as T;
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    request<{ ok: boolean }>('/api/auth/login', {
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
  description: string;
  price: number;
};

export const servicesApi = {
  list: () => request<Service[]>('/api/services'),
  create: (data: { name: string; description: string; price: number }) =>
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
