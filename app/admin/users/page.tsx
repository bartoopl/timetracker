import { PrismaClient } from '@prisma/client';
import UsersList from './UsersList';
import { User } from '@/types/user';

const prisma = new PrismaClient();

async function getUsers(): Promise<User[]> {
  return prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export default async function UsersPage() {
  const users = await getUsers();
  return <UsersList users={users} />;
} 