const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  const prisma = new PrismaClient();
  
  try {
    // Najpierw sprawdź, czy użytkownik już istnieje
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (existingUser) {
      console.log('Użytkownik admin już istnieje!');
      return;
    }

    // Generuj hash hasła
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Twórz nowego użytkownika
    const user = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Administrator',
        password: hashedPassword,
      },
    });

    console.log('Utworzono użytkownika admin:', {
      id: user.id,
      email: user.email,
      name: user.name
    });
  } catch (error) {
    console.error('Błąd podczas tworzenia użytkownika:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 