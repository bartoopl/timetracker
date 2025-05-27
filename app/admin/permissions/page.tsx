import { PrismaClient } from '@prisma/client';
import PermissionsList from './PermissionsList';

const prisma = new PrismaClient();

async function getPermissions() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users;
}

export default async function PermissionsPage() {
  const users = await getPermissions();
  return <PermissionsList users={users} />;
} 