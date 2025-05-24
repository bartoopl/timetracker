const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing database connection...');
    
    // Try to connect to the database
    await prisma.$connect();
    console.log('Successfully connected to the database!');
    
    // Try to query the database
    const userCount = await prisma.user.count();
    console.log(`Number of users in database: ${userCount}`);
    
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 