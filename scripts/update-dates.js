const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting date update...');
    
    // Get all tasks
    const tasks = await prisma.task.findMany();
    console.log(`Found ${tasks.length} tasks to update`);

    // Update each task's dates
    for (const task of tasks) {
      const startTime = new Date(task.startTime);
      const endTime = task.endTime ? new Date(task.endTime) : null;

      // Update year to 2025
      startTime.setFullYear(2025);
      if (endTime) {
        endTime.setFullYear(2025);
      }

      // Update task in database
      await prisma.task.update({
        where: { id: task.id },
        data: {
          startTime: startTime,
          endTime: endTime,
          // Recalculate duration
          duration: endTime ? endTime.getTime() - startTime.getTime() : null
        }
      });

      console.log(`Updated task ${task.id}:`, {
        title: task.title,
        oldStartTime: task.startTime,
        newStartTime: startTime,
        oldEndTime: task.endTime,
        newEndTime: endTime
      });
    }

    console.log('Date update completed successfully');
  } catch (error) {
    console.error('Error updating dates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 