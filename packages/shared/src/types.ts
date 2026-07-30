export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type WaitlistStatus = "WAITING" | "NOTIFIED" | "CONVERTED" | "EXPIRED";

export interface Service {
  id: string;
  name: string;
  durationMin: number;
  /** null = "sob consulta" (sem preço fixo) */
  price: number | null;
  active: boolean;
  order: number;
}

export interface Slot {
  time: string; // "09:00"
  available: boolean;
}

export interface AppointmentSummary {
  id: string;
  clientName: string;
  clientWhatsapp: string;
  serviceName: string;
  date: string; // "2026-08-04"
  startTime: string;
  endTime: string;
  price: number | null;
  status: AppointmentStatus;
}

export interface BookingPayload {
  date: string;
  startTime: string;
  serviceId: string;
  clientName: string;
  clientWhatsapp: string;
  clientEmail?: string;
}

export interface WaitlistPayload {
  date: string;
  time: string;
  serviceId: string;
  clientName: string;
  clientWhatsapp: string;
}

export interface Settings {
  id: string;
  businessName: string;
  bio: string;
  whatsapp: string;
  instagram: string;
  address: string | null;
  mapsUrl: string | null;
}

export interface SettingsAdmin extends Settings {
  adminEmail: string;
}

export interface WeeklyDay {
  id: string;
  weekday: number; // 0=domingo..6=sábado
  isOpen: boolean;
  startTime: string | null;
  endTime: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  slotMinutes: number;
}

export interface BlockedDate {
  id: string;
  date: string;
  label: string;
}

export interface SlotsResponse {
  date: string;
  open: boolean;
  reason: string | null;
  slots: Slot[];
}

export interface Testimonial {
  id: string;
  author: string;
  text: string;
  rating: number;
  order: number;
}

export interface GalleryPhoto {
  id: string;
  cloudinaryId: string;
  url: string;
  order: number;
}

interface PartyRef {
  id: string;
  name: string;
  whatsapp: string;
}

interface ServiceRef {
  id: string;
  name: string;
}

export interface AppointmentResult {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  price: number | null;
  source: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  client: PartyRef;
  service: ServiceRef;
}

export interface WaitlistResult {
  id: string;
  date: string;
  time: string;
  status: WaitlistStatus;
  createdAt: string;
  client: PartyRef;
  service: ServiceRef;
}
