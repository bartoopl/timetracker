import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Pobierz klientów przypisanych do użytkownika
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    return NextResponse.json(userClients.map(uc => uc.client));
  } catch (error) {
    console.error('Error fetching user clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user clients' },
      { status: 500 }
    );
  }
}

// Przypisz klientów do użytkownika
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { clientIds } = await request.json();

    if (!Array.isArray(clientIds)) {
      return NextResponse.json(
        { error: 'clientIds must be an array' },
        { status: 400 }
      );
    }

    // Usuń wszystkie istniejące przypisania
    await prisma.userClient.deleteMany({
      where: {
        userId: params.id,
      },
    });

    // Dodaj nowe przypisania
    const userClients = await Promise.all(
      clientIds.map(clientId =>
        prisma.userClient.create({
          data: {
            userId: params.id,
            clientId,
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
        })
      )
    );

    return NextResponse.json(userClients.map(uc => uc.client));
  } catch (error) {
    console.error('Error assigning clients to user:', error);
    return NextResponse.json(
      { error: 'Failed to assign clients to user' },
      { status: 500 }
    );
  }
} 