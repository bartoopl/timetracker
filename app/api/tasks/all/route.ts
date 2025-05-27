import { NextResponse } from 'next/server';
import { authOptions } from '@/app/auth';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  console.log('GET /api/tasks/all - Start');
  
  const session = await getServerSession(authOptions);
  console.log('Session:', session);

  if (!session) {
    console.log('No session found');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const clientId = searchParams.get('clientId');

    console.log('Raw date parameters:', { startDate, endDate });

    // Pobierz listę klientów, do których użytkownik ma dostęp
    const userClients = await prisma.userClient.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        clientId: true,
      },
    });

    const allowedClientIds = userClients.map(uc => uc.clientId);

    const where: any = {
      userId: session.user.id,
    };

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Jeśli użytkownik nie jest adminem, pokazuj tylko zadania dla klientów, do których ma dostęp
    if (session.user.role !== 'ADMIN') {
      where.clientId = {
        in: allowedClientIds,
      };
    } else if (clientId) {
      // Jeśli jest adminem i wybrano konkretnego klienta
      where.clientId = clientId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    // Calculate duration for each task
    const tasksWithDuration = tasks.map(task => ({
      ...task,
      duration: task.endTime ? new Date(task.endTime).getTime() - new Date(task.startTime).getTime() : null,
    }));

    return new Response(JSON.stringify(tasksWithDuration), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch tasks' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 