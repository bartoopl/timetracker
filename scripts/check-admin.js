const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const admin = await prisma.user.findFirst({
      where: {
        email: 'admin@example.com'
      }
    });

    console.log('Admin user:', admin);

    if (admin) {
      const tasks = await prisma.task.findMany({
        where: {
          userId: admin.id
        }
      });

      console.log('Number of tasks:', tasks.length);
      console.log('First few tasks:', tasks.slice(0, 3));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 