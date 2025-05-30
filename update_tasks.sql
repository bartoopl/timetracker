-- Najpierw sprawdźmy, czy klient istnieje
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Client" WHERE id = 'cmb6e86m40000o0ir5iobt4wr') THEN
        RAISE EXCEPTION 'Klient o ID cmb6e86m40000o0ir5iobt4wr nie istnieje';
    END IF;
END $$;

-- Aktualizuj wszystkie zadania bez klienta
UPDATE "Task"
SET "clientId" = 'cmb6e86m40000o0ir5iobt4wr',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "clientId" IS NULL;

-- Wyświetl informację o liczbie zaktualizowanych zadań
SELECT COUNT(*) as updated_tasks
FROM "Task"
WHERE "clientId" = 'cmb6e86m40000o0ir5iobt4wr'; 