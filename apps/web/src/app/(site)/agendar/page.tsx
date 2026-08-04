import { getAvailableDates, getServices, getSettings } from "@/lib/api";
import { BookingWizard } from "@/components/booking/booking-wizard";

export default async function AgendarPage() {
  const [services, availableDates, settings] = await Promise.all([
    getServices(),
    getAvailableDates(),
    getSettings(),
  ]);

  return (
    <BookingWizard
      services={services}
      availableDates={availableDates}
      whatsappNumber={settings.whatsapp}
    />
  );
}
