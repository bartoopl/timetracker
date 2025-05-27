import { NextResponse } from 'next/server';
import { authOptions } from '@/app/auth';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UserClient {
  client: {
    id: string;
    name: string;
    email: string;
  };
}

// Pobierz klientów przypisanych do użytkownika
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (session.user.role !== 'ADMIN') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const userClients = await prisma.userClient.findMany({
      where: {
        userId: params.id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(userClients.map((uc: UserClient) => uc.client)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching user clients:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch user clients' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Przypisz klientów do użytkownika
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (session.user.role !== 'ADMIN') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { clientIds } = await request.json();

    // Usuń wszystkie istniejące uprawnienia
    await prisma.userClient.deleteMany({
      where: {
        userId: params.id,
      },
    });

    // Dodaj nowe uprawnienia
    if (clientIds && clientIds.length > 0) {
      await prisma.userClient.createMany({
        data: clientIds.map((clientId: string) => ({
          userId: params.id,
          clientId,
        })),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating user clients:', error);
    return new Response(JSON.stringify({ error: 'Failed to update user clients' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 