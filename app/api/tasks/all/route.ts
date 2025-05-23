import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';

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

    console.log('Raw date parameters:', { startDate, endDate });

    let whereClause: any = {};

    if (startDate && endDate) {
      // Create UTC dates
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);

      console.log('Processed dates:', {
        start: start.toISOString(),
        end: end.toISOString(),
        startTimestamp: start.getTime(),
        endTimestamp: end.getTime()
      });

      // Get all tasks first
      const allTasks = await prisma.task.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          startTime: 'desc'
        }
      });

      console.log('All tasks:', {
        count: allTasks.length,
        firstTask: allTasks[0] ? {
          startTime: allTasks[0].startTime,
          startTimestamp: new Date(allTasks[0].startTime).getTime()
        } : null
      });

      // Filter tasks manually
      const filteredTasks = allTasks.filter(task => {
        const taskStart = new Date(task.startTime);
        return taskStart >= start && taskStart <= end;
      });

      console.log('Filtered tasks:', {
        count: filteredTasks.length,
        firstTask: filteredTasks[0] ? {
          startTime: filteredTasks[0].startTime,
          startTimestamp: new Date(filteredTasks[0].startTime).getTime()
        } : null
      });

      // Calculate duration if not set
      const processedTasks = filteredTasks.map(task => {
        let duration = task.duration;
        if (!duration && task.startTime && task.endTime) {
          duration = new Date(task.endTime).getTime() - new Date(task.startTime).getTime();
        }
        return {
          ...task,
          duration: Number(duration) || 0
        };
      });

      return new Response(JSON.stringify(processedTasks), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If no date range is provided, return all tasks
    const tasks = await prisma.task.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    // Calculate duration if not set
    const processedTasks = tasks.map(task => {
      let duration = task.duration;
      if (!duration && task.startTime && task.endTime) {
        duration = new Date(task.endTime).getTime() - new Date(task.startTime).getTime();
      }
      return {
        ...task,
        duration: Number(duration) || 0
      };
    });

    return new Response(JSON.stringify(processedTasks), {
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