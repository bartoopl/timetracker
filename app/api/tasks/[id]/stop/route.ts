import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.endTime) {
      return NextResponse.json(
        { error: 'Task is already stopped' },
        { status: 400 }
      );
    }

    const endTime = new Date();
    const duration = endTime.getTime() - task.startTime.getTime();

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        endTime,
        duration,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error stopping task:', error);
    return NextResponse.json(
      { error: 'Failed to stop task' },
      { status: 500 }
    );
  }
} 