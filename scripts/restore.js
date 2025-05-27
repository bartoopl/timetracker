const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restore(backupPath) {
  try {
    // Wczytaj dane z pliku
    const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    // Przywróć dane
    for (const user of data) {
      // Zapisz użytkownika
      const { tasks, ...userData } = user;
      const createdUser = await prisma.user.create({
        data: userData
      });

      // Zapisz zadania
      for (const task of tasks) {
        const { id, userId, ...taskData } = task;
        await prisma.task.create({
          data: {
            ...taskData,
            userId: createdUser.id
          }
        });
      }
    }

    console.log('Dane zostały przywrócone pomyślnie');
  } catch (error) {
    console.error('Błąd podczas przywracania danych:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Sprawdź czy podano ścieżkę do backupu
const backupPath = process.argv[2];
if (!backupPath) {
  console.error('Proszę podać ścieżkę do pliku backupu');
  process.exit(1);
}

restore(backupPath); 