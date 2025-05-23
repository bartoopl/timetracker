const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const tasks = [
  // Dodawanie produktów (240 modeli)
  ...Array.from({ length: 24 }, (_, i) => {
    const startTime = new Date(2024, 4, Math.floor(i / 2) + 1, 9 + (i % 2) * 4, 0);
    const endTime = new Date(2024, 4, Math.floor(i / 2) + 1, 13 + (i % 2) * 4, 0);
    return {
      title: `Dodawanie produktów - partia ${i + 1}`,
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      description: `Dodano 10 modeli produktów do sklepu`
    };
  }),

  // Newslettery (10)
  ...Array.from({ length: 10 }, (_, i) => {
    const startTime = new Date(2024, 4, i * 3 + 1, 10, 0);
    const endTime = new Date(2024, 4, i * 3 + 1, 14, 0);
    return {
      title: `Newsletter - edycja ${i + 1}`,
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      description: 'Przygotowanie i wysyłka newslettera'
    };
  }),

  // Webpushy (20)
  ...Array.from({ length: 20 }, (_, i) => {
    const startTime = new Date(2024, 4, Math.floor(i / 2) + 1, 14, 0);
    const endTime = new Date(2024, 4, Math.floor(i / 2) + 1, 16, 0);
    return {
      title: `Konfiguracja webpush - kampania ${i + 1}`,
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      description: 'Konfiguracja i testowanie powiadomień webpush'
    };
  }),

  // Obsługa klienta (codziennie)
  ...Array.from({ length: 22 }, (_, i) => {
    const startTime = new Date(2024, 4, i + 1, 8, 0);
    const endTime = new Date(2024, 4, i + 1, 10, 0);
    return {
      title: 'Obsługa zapytań klientów',
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      description: 'Odpowiedzi na zapytania z biura obsługi klienta'
    };
  }),

  // Dodatkowe zadania administracyjne
  {
    title: 'Aktualizacja dokumentacji technicznej',
    startTime: new Date(2024, 4, 15, 10, 0),
    endTime: new Date(2024, 4, 15, 14, 0),
    duration: new Date(2024, 4, 15, 14, 0).getTime() - new Date(2024, 4, 15, 10, 0).getTime(),
    description: 'Aktualizacja dokumentacji systemu'
  },
  {
    title: 'Optymalizacja wydajności bazy danych',
    startTime: new Date(2024, 4, 20, 9, 0),
    endTime: new Date(2024, 4, 20, 13, 0),
    duration: new Date(2024, 4, 20, 13, 0).getTime() - new Date(2024, 4, 20, 9, 0).getTime(),
    description: 'Optymalizacja zapytań i indeksów'
  },
  {
    title: 'Testy wydajnościowe systemu',
    startTime: new Date(2024, 4, 25, 11, 0),
    endTime: new Date(2024, 4, 25, 15, 0),
    duration: new Date(2024, 4, 25, 15, 0).getTime() - new Date(2024, 4, 25, 11, 0).getTime(),
    description: 'Przeprowadzenie testów wydajnościowych'
  }
];

async function main() {
  try {
    // Pobierz ID użytkownika admin
    const admin = await prisma.user.findFirst({
      where: {
        email: 'admin@example.com'
      }
    });

    if (!admin) {
      console.error('Nie znaleziono użytkownika admin');
      return;
    }

    // Usuń istniejące zadania za maj
    await prisma.task.deleteMany({
      where: {
        startTime: {
          gte: new Date(2024, 4, 1),
          lte: new Date(2024, 4, 31)
        }
      }
    });

    // Dodaj zadania
    for (const task of tasks) {
      await prisma.task.create({
        data: {
          ...task,
          userId: admin.id
        }
      });
    }

    console.log('Dodano wszystkie zadania za maj');
  } catch (error) {
    console.error('Błąd podczas dodawania zadań:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 