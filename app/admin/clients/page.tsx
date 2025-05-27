import { PrismaClient } from '@prisma/client';
import ClientsList from './ClientsList';

const prisma = new PrismaClient();

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  createdAt: Date;
}

async function getClients(): Promise<Client[]> {
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