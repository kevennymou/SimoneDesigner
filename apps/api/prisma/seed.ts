import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Em produção, defina ADMIN_USERNAME e ADMIN_PASSWORD no ambiente antes de rodar o seed —
// os valores abaixo são só um fallback conveniente pra desenvolvimento local.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "simone";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "simone123";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.admin.upsert({
    where: { username: ADMIN_USERNAME },
    update: {},
    create: {
      username: ADMIN_USERNAME,
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

  // Exemplo de disponibilidade nos próximos dias, só pra não deixar o dev local vazio —
  // em produção Simone escolhe os horários de cada data pelo painel admin.
  const exampleTimes = ["09:00", "09:30", "10:00", "14:00", "14:30", "15:00", "16:00"];
  const today = new Date();
  for (let i = 1; i <= 5; i++) {
    const d = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + i),
    );
    await prisma.dayAvailability.upsert({
      where: { date: d },
      update: {},
      create: { date: d, times: exampleTimes },
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
      bio: "Designer de unhas em gel em Campina Grande. Realço a sua beleza a cada detalhe.",
      whatsapp: process.env.WHATSAPP_NUMBER ?? "5583998559075",
      instagram: "simonemoura.nails",
      adminEmail: process.env.ADMIN_EMAIL ?? "admin@simonemoura.com.br",
    },
  });

  console.log("Seed concluído.");
  if (!process.env.ADMIN_PASSWORD) {
    console.log(
      `Login admin: usuária "${ADMIN_USERNAME}" / senha "${ADMIN_PASSWORD}" (padrão de dev — defina ADMIN_PASSWORD no ambiente antes do seed de produção).`,
    );
  } else {
    console.log(`Login admin: usuária "${ADMIN_USERNAME}" — senha definida via ADMIN_PASSWORD.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
