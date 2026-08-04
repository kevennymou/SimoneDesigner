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

export interface Admin {
  id: string;
  username: string;
  email: string;
}

export interface PeriodStats {
  count: number;
  revenue: number;
  avgTicket: number;
}

export interface DashboardSummary {
  today: PeriodStats;
  week: PeriodStats;
  month: PeriodStats;
  newClients: number;
  recurringClients: number;
  todayAppointments: Array<{
    id: string;
    time: string;
    client: string;
    service: string;
    price: number | null;
    status: AppointmentStatus;
  }>;
  topProcedures: Array<{ name: string; count: number; pct: number }>;
}

export interface ClientSummary {
  id: string;
  name: string;
  whatsapp: string;
  visits: number;
  noShows: number;
}

export interface ClientDetail extends ClientSummary {
  email: string | null;
  cancellations: number;
  total: number;
  history: Array<{
    id: string;
    date: string;
    startTime: string;
    service: string;
    price: number | null;
    status: AppointmentStatus;
  }>;
}

export interface UpdateAppointmentPayload {
  date?: string;
  startTime?: string;
  status?: AppointmentStatus;
  cancelReason?: string;
}

export interface UpsertServicePayload {
  name: string;
  durationMin: number;
  price: number | null;
  order?: number;
}

export interface ReportResult {
  from: string;
  to: string;
  revenue: number;
  count: number;
  avgTicket: number;
  clientsServed: number;
  noShows: number;
  cancellations: number;
  busiestHour: string | null;
  topProcedures: Array<{ name: string; count: number; pct: number }>;
  series: Array<{ label: string; revenue: number; count: number }>;
}
