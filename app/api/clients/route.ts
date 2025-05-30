import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  console.log('GET /api/clients - Start');
  
  const session = await getServerSession(authOptions);
  console.log('Session:', session);

  if (!session) {
    console.log('No session found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Fetching clients for user:', session.user.id);
    
    // Jeśli użytkownik jest administratorem, zwróć wszystkich klientów
    if (session.user.role === 'ADMIN') {
      console.log('User is admin, returning all clients');
      const clients = await prisma.client.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
      console.log('Found clients:', clients);
      return NextResponse.json(clients);
    }
    
    // Dla zwykłych użytkowników sprawdź uprawnienia
    const userClients = await prisma.userClient.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        clientId: true,
      },
    });

    const allowedClientIds = userClients.map(uc => uc.clientId);
    console.log('Allowed client IDs:', allowedClientIds);

    const clients = await prisma.client.findMany({
      where: {
        id: {
          in: allowedClientIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log('Found clients:', clients);
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, phone, address } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if client already exists
    const existingClient = await prisma.client.findUnique({
      where: { email },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'Client with this email already exists' },
        { status: 400 }
      );
    }

    // Create client
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    return NextResponse.json({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
} 