import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: {
        id: params.taskId,
        userId: session.user.id,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.endTime) {
      return NextResponse.json(
        { error: 'Task is already completed' },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: params.taskId,
      },
      data: {
        endTime: new Date(),
        duration: new Date().getTime() - new Date(task.startTime).getTime(),
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Błąd podczas zatrzymywania zadania:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas zatrzymywania zadania' },
      { status: 500 }
    );
  }
} 