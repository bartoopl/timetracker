const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdminRole() {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        email: 'admin@example.com'
      },
      data: {
        role: 'ADMIN'
      }
    });

    console.log('Zaktualizowano rolę użytkownika:', updatedUser);
  } catch (error) {
    console.error('Błąd podczas aktualizacji roli:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminRole(); 