import type {
  Admin,
  AppointmentResult,
  BlockedDate,
  BookingPayload,
  ClientDetail,
  ClientSummary,
  DashboardSummary,
  GalleryPhoto,
  Service,
  Settings,
  SettingsAdmin,
  SlotsResponse,
  Testimonial,
  UpdateAppointmentPayload,
  WaitlistPayload,
  WaitlistResult,
  WeeklyDay,
} from "@simone/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions extends RequestInit {
  /** Cabeçalho Cookie a repassar quando a chamada parte de um Server Component. */
  cookie?: string;
}

async function request<T>(path: string, init?: RequestOptions): Promise<T> {
  const { cookie, ...rest } = init ?? {};
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    cache: "no-store",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...rest.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      body?.message ?? "Não foi possível falar com o servidor agora.",
    );
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------- público ----------

export function getSettings() {
  return request<Settings>("/settings");
}

export function getServices() {
  return request<Service[]>("/services");
}

export function getWeeklyAvailability() {
  return request<WeeklyDay[]>("/availability/weekly");
}

export function getBlocks() {
  return request<BlockedDate[]>("/availability/blocks");
}

export function getSlots(date: string, serviceId?: string) {
  const params = new URLSearchParams({ date, ...(serviceId ? { serviceId } : {}) });
  return request<SlotsResponse>(`/availability/slots?${params}`);
}

export function createAppointment(payload: BookingPayload) {
  return request<AppointmentResult>("/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function joinWaitlist(payload: WaitlistPayload) {
  return request<WaitlistResult>("/waitlist", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getTestimonials() {
  return request<Testimonial[]>("/testimonials");
}

export function getGalleryPhotos() {
  return request<GalleryPhoto[]>("/gallery");
}

// ---------- admin ----------

export function login(username: string, password: string) {
  return request<{ admin: Admin }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logout() {
  return request<{ ok: true }>("/auth/logout", { method: "POST" });
}

export function getMe(cookie?: string) {
  return request<Admin>("/auth/me", { cookie });
}

export function getDashboardSummary(cookie?: string) {
  return request<DashboardSummary>("/dashboard/summary", { cookie });
}

export interface AppointmentFilters {
  date?: string;
  from?: string;
  to?: string;
  status?: string;
}

export function getAppointments(filters: AppointmentFilters = {}, cookie?: string) {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) as Record<string, string>,
  );
  const qs = params.toString();
  return request<AppointmentResult[]>(`/appointments${qs ? `?${qs}` : ""}`, { cookie });
}

export function updateAppointment(id: string, payload: UpdateAppointmentPayload) {
  return request<AppointmentResult>(`/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function searchClients(query?: string, cookie?: string) {
  const qs = query ? `?search=${encodeURIComponent(query)}` : "";
  return request<ClientSummary[]>(`/clients${qs}`, { cookie });
}

export function getClientDetail(id: string, cookie?: string) {
  return request<ClientDetail>(`/clients/${id}`, { cookie });
}

export function getWaitlistAdmin(cookie?: string) {
  return request<WaitlistResult[]>("/waitlist", { cookie });
}

export function notifyWaitlist(id: string) {
  return request<{ whatsappUrl: string }>(`/waitlist/${id}/notify`, { method: "POST" });
}

export function removeWaitlistEntry(id: string) {
  return request<{ ok: true }>(`/waitlist/${id}`, { method: "DELETE" });
}

export function getSettingsAdmin(cookie?: string) {
  return request<SettingsAdmin>("/settings/admin", { cookie });
}
