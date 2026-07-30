import { getBlocks, getServices, getSettings, getWeeklyAvailability } from "@/lib/api";
import { BookingWizard } from "@/components/booking/booking-wizard";

export default async function AgendarPage() {
  const [services, weekly, blocks, settings] = await Promise.all([
    getServices(),
    getWeeklyAvailability(),
    getBlocks(),
    getSettings(),
  ]);

  return (
    <BookingWizard
      services={services}
      weekly={weekly}
      blocks={blocks}
      whatsappNumber={settings.whatsapp}
    />
  );
}
