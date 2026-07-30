import type {
  AppointmentResult,
  BlockedDate,
  BookingPayload,
  GalleryPhoto,
  Service,
  Settings,
  SlotsResponse,
  Testimonial,
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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers },
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
