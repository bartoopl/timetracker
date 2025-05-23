import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const password = 'admin123';
  const name = 'Administrator';

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    console.log('Utworzono użytkownika:', user);
  } catch (error) {
    console.error('Błąd podczas tworzenia użytkownika:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 