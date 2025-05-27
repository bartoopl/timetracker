require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backup() {
  try {
    // Pobierz wszystkie dane
    const users = await prisma.user.findMany({
      include: {
        tasks: true
      }
    });

    // Zapisz do pliku
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.json`);
    
    fs.writeFileSync(backupPath, JSON.stringify(users, null, 2));
    console.log(`Backup został zapisany w: ${backupPath}`);
  } catch (error) {
    console.error('Błąd podczas tworzenia backupu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backup(); 