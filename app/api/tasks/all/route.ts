import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const clientId = searchParams.get('clientId');
    const userId = searchParams.get('userId');

    const where: any = {};

    if (startDate && endDate) {
      where.AND = [
        {
          startTime: {
            lte: new Date(endDate),
          },
        },
        {
          OR: [
            {
              endTime: {
                gte: new Date(startDate),
              },
            },
            {
              endTime: null,
            },
          ],
        },
      ];
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (userId) {
      where.userId = userId;
    }

    // If user is not admin, only show their tasks
    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id;
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

    // Calculate duration for tasks that don't have it
    const tasksWithDuration = tasks.map(task => {
      if (!task.duration && task.endTime) {
        return {
          ...task,
          duration: new Date(task.endTime).getTime() - new Date(task.startTime).getTime(),
        };
      }
      return task;
    });

    return NextResponse.json(tasksWithDuration);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 