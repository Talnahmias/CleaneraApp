import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const standard = await prisma.serviceType.upsert({
    where: { slug: 'standard-clean' },
    update: {},
    create: {
      slug: 'standard-clean',
      name: 'Standard Clean',
      description: 'Regular home cleaning for up to 3 rooms',
      basePriceCents: 12000,
      durationMinutes: 120,
      checklistTemplates: {
        create: [
          { label: 'Vacuum and mop floors', sortOrder: 1 },
          { label: 'Clean bathrooms', sortOrder: 2 },
          { label: 'Wipe kitchen surfaces', sortOrder: 3 },
          { label: 'Empty trash bins', sortOrder: 4 },
        ],
      },
    },
  });

  await prisma.serviceType.upsert({
    where: { slug: 'deep-clean' },
    update: {},
    create: {
      slug: 'deep-clean',
      name: 'Deep Clean',
      description: 'Thorough cleaning including inside appliances',
      basePriceCents: 22000,
      durationMinutes: 240,
      checklistTemplates: {
        create: [
          { label: 'Standard clean tasks', sortOrder: 1 },
          { label: 'Inside oven and fridge', sortOrder: 2 },
          { label: 'Baseboards and window sills', sortOrder: 3 },
        ],
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { phone: '+10000000001' },
    update: {},
    create: {
      role: 'ADMIN',
      phone: '+10000000001',
      email: 'admin@cleanersapp.local',
      firstName: 'Admin',
      lastName: 'User',
    },
  });

  const customer = await prisma.user.upsert({
    where: { phone: '+10000000002' },
    update: {},
    create: {
      role: 'CUSTOMER',
      phone: '+10000000002',
      email: 'customer@cleanersapp.local',
      firstName: 'Jane',
      lastName: 'Customer',
      addresses: {
        create: {
          label: 'Home',
          line1: '123 Main St',
          city: 'Tel Aviv',
          postalCode: '61000',
          lat: 32.0853,
          lng: 34.7818,
          isDefault: true,
        },
      },
    },
  });

  const cleaner = await prisma.user.upsert({
    where: { phone: '+10000000003' },
    update: {},
    create: {
      role: 'CLEANER',
      phone: '+10000000003',
      email: 'cleaner@cleanersapp.local',
      firstName: 'Alex',
      lastName: 'Cleaner',
      cleanerProfile: {
        create: {
          verificationStatus: 'APPROVED',
          isOnline: true,
          lastLat: 32.09,
          lastLng: 34.78,
          bio: 'Experienced home cleaner',
        },
      },
    },
  });

  console.log('Seeded:', { standard: standard.slug, admin: admin.id, customer: customer.id, cleaner: cleaner.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
