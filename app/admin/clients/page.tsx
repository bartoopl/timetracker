import { PrismaClient } from '@prisma/client';
import ClientsList from './ClientsList';

const prisma = new PrismaClient();

async function getClients() {
  return prisma.client.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      createdAt: true,
    },
  });
}

export default async function ClientsPage() {
  const clients = await getClients();
  return <ClientsList clients={clients} />;
} 