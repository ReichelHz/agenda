import { API_URL } from './api-config';

const API_BASE = API_URL;

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

  const contentType = res.headers.get('Content-Type') ?? '';
  const rawText = await res.text();

  const parseBody = <R>(text: string): R | null => {
    if (!text) return null;
    if (contentType.includes('application/json')) {
      return JSON.parse(text) as R;
    }
    return text as unknown as R;
  };

  if (!res.ok) {
    let message = rawText || `HTTP ${res.status}`;

    if (contentType.includes('application/json') && rawText) {
      try {
        const json = JSON.parse(rawText) as { error?: string; message?: string };
        message = json.error || json.message || rawText;
      } catch {
        message = rawText;
      }
    }

    throw new Error(message);
  }

  return parseBody<T>(rawText) as T;
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

  logout: async () => ({ ok: true }),
};

// Users
export const usersApi = {
  me: () =>
    request<{ id: number; name: string; email: string; role: string }>(
      '/api/users/me'
    ),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>('/api/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Professional profile
export type ProfessionalProfile = {
  id: number;
  name: string;
  email: string;
  description?: string;
  phone?: string;
  birthDate?: string;
  homeVisitFee?: number;
  allowsHomeVisit: boolean;
};

export const professionalApi = {
  getSettings: () => request<ProfessionalProfile>('/api/professional/settings'),
  updateSettings: (data: Partial<Omit<ProfessionalProfile, 'id' | 'email'>>) =>
    request<ProfessionalProfile>('/api/professional/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// Services
export type ServiceModality = 'PRESENCIAL' | 'VIRTUAL' | 'AMBAS';

export type Service = {
  id: number;
  name: string;
  description?: string;
  price: number;
  durationMinutes?: number;
  modality: ServiceModality;
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
  create: (data: { name: string; description: string; price: number; durationMinutes?: number; modality: ServiceModality; professional?: { id: number } }) =>
    request<Service>('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name?: string; description?: string; price?: number; durationMinutes?: number; modality?: ServiceModality }) =>
    request<Service>(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/api/services/${id}`, { method: 'DELETE' }),
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
  delete: (id: number) =>
    request<void>(`/api/availabilities/${id}`, { method: 'DELETE' }),
};

// Appointments
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type LocationType = 'OFFICE' | 'HOME' | 'VIRTUAL';

export type Appointment = {
  id: number;
  reservationCode: string;
  patientName: string;
  patientEmail: string;
  professionalName: string;
  serviceName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  locationType?: LocationType;
  address?: string;
  totalPrice?: number;
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
    locationType?: LocationType;
    address?: string;
  }) =>
    request<Appointment>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  myAppointments: () => request<Appointment[]>('/api/appointments/me'),
  occupiedTimes: (professionalId: number, date: string) =>
    request<string[]>(`/api/appointments/occupied?professionalId=${professionalId}&date=${date}`),
  getByCode: (code: string, email: string) =>
    request<Appointment>(`/api/appointments/by-code/${code}?email=${encodeURIComponent(email)}`),
  updateStatusByCode: (code: string, email: string, status: AppointmentStatus) =>
    request<Appointment>(
      `/api/appointments/${code}/status?email=${encodeURIComponent(email)}&status=${status}`,
      { method: 'PATCH' }
    ),
  cancel: (code: string, email: string) =>
    request<Appointment>(
      `/api/appointments/${code}/status?email=${encodeURIComponent(email)}&status=CANCELLED`,
      { method: 'PATCH' }
    ),
  delete: (id: number) =>
    request<void>(`/api/appointments/${id}`, { method: 'DELETE' }),
};

// Addresses
export type PatientAddress = {
  id: number;
  label: string;
  address: string;
};

export const addressesApi = {
  list: () => request<PatientAddress[]>('/api/addresses'),
  add: (data: { label: string; address: string }) =>
    request<PatientAddress>('/api/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    request<void>(`/api/addresses/${id}`, { method: 'DELETE' }),
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
