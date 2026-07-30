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
