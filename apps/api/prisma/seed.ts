import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DEV_ADMIN_USERNAME = "simone";
const DEV_ADMIN_PASSWORD = "simone123"; // dev only — trocar antes de produção

async function main() {
  const passwordHash = await bcrypt.hash(DEV_ADMIN_PASSWORD, 10);
  await prisma.admin.upsert({
    where: { username: DEV_ADMIN_USERNAME },
    update: {},
    create: {
      username: DEV_ADMIN_USERNAME,
      passwordHash,
      email: process.env.ADMIN_EMAIL ?? "admin@simonemoura.com.br",
    },
  });

  const services = [
    { id: "along", name: "Alongamento em Gel", durationMin: 150, price: 130 },
    { id: "manut", name: "Manutenção", durationMin: 120, price: 100 },
    { id: "blind", name: "Blindagem", durationMin: 90, price: null },
    { id: "esmalt", name: "Esmaltação em Gel", durationMin: 60, price: null },
    { id: "deco", name: "Decoração", durationMin: 30, price: null },
  ];
  for (const [index, s] of services.entries()) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {},
      create: { ...s, order: index },
    });
  }

  // 0=domingo ... 6=sábado — atendimento Ter–Sáb, 9h–18h, intervalo 12h–13h
  const weekly = [
    { weekday: 0, isOpen: false },
    { weekday: 1, isOpen: false },
    { weekday: 2, isOpen: true },
    { weekday: 3, isOpen: true },
    { weekday: 4, isOpen: true },
    { weekday: 5, isOpen: true },
    { weekday: 6, isOpen: true },
  ];
  for (const w of weekly) {
    await prisma.weeklyAvailability.upsert({
      where: { weekday: w.weekday },
      update: {},
      create: {
        weekday: w.weekday,
        isOpen: w.isOpen,
        startTime: w.isOpen ? "09:00" : null,
        endTime: w.isOpen ? "18:00" : null,
        breakStart: w.isOpen ? "12:00" : null,
        breakEnd: w.isOpen ? "13:00" : null,
        slotMinutes: 30,
      },
    });
  }

  const hasTestimonial = await prisma.testimonial.findFirst();
  if (!hasTestimonial) {
    await prisma.testimonial.create({
      data: {
        author: 'Larissa A.',
        text: 'Trabalho impecável e um carinho que faz toda a diferença. Sempre volto.',
        rating: 5,
        order: 0,
      },
    });
  }

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      businessName: "Simone Moura",
      bio: "Designer de unhas em gel em João Pessoa. Realço a sua beleza a cada detalhe.",
      whatsapp: process.env.WHATSAPP_NUMBER ?? "5583998559075",
      instagram: "simonemoura.nails",
      adminEmail: process.env.ADMIN_EMAIL ?? "admin@simonemoura.com.br",
    },
  });

  console.log("Seed concluído.");
  console.log(
    `Login admin (dev): usuária "${DEV_ADMIN_USERNAME}" / senha "${DEV_ADMIN_PASSWORD}" — trocar antes de produção.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
