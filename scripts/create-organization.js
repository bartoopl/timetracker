const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // 1. Utwórz organizację CreativeTrust
  const organization = await prisma.organization.create({
    data: {
      name: 'CreativeTrust',
    },
  });

  console.log('Created organization:', organization);

  // 2. Przypisz wszystkich użytkowników do organizacji
  const updatedUsers = await prisma.user.updateMany({
    where: {
      organizationId: null,
    },
    data: {
      organizationId: organization.id,
    },
  });

  console.log('Updated users:', updatedUsers);

  // 3. Przypisz wszystkich klientów do organizacji
  const updatedClients = await prisma.client.updateMany({
    where: {
      organizationId: null,
    },
    data: {
      organizationId: organization.id,
    },
  });

  console.log('Updated clients:', updatedClients);

  // 4. Przypisz wszystkie zadania do organizacji
  const updatedTasks = await prisma.task.updateMany({
    where: {
      organizationId: null,
    },
    data: {
      organizationId: organization.id,
    },
  });

  console.log('Updated tasks:', updatedTasks);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 