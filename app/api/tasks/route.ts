import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        endTime: null, // tylko aktywne zadania
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Błąd podczas pobierania zadań:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania zadań' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Otrzymane dane:', body);

    const { title, description, startTime } = body;

    if (!title || !startTime) {
      return NextResponse.json(
        { error: 'Tytuł i czas rozpoczęcia są wymagane' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        userId: session.user.id,
      },
    });

    console.log('Utworzone zadanie:', task);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Błąd podczas tworzenia zadania:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas tworzenia zadania' },
      { status: 500 }
    );
  }
} 