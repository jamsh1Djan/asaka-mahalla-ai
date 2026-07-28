-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mahalla" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomi" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "tashkil" INTEGER NOT NULL,
    "aholi" INTEGER NOT NULL,
    "erkak" INTEGER NOT NULL,
    "ayol" INTEGER NOT NULL,
    "xonadon" INTEGER NOT NULL,
    "oila" INTEGER NOT NULL,
    "tadbirkorlik" INTEGER NOT NULL,
    "yatt" INTEGER NOT NULL,
    "mchj" INTEGER NOT NULL DEFAULT 0,
    "faoliyatTurlari" TEXT NOT NULL DEFAULT '',
    "vakansiya" INTEGER NOT NULL,
    "drayver" TEXT NOT NULL,
    "agent" TEXT NOT NULL,
    "image" TEXT,
    "color" TEXT NOT NULL,
    "mapPoints" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Mahalla" ("agent", "aholi", "ayol", "color", "createdAt", "drayver", "erkak", "id", "image", "mapPoints", "nomi", "oila", "sector", "tadbirkorlik", "tashkil", "updatedAt", "vakansiya", "xonadon", "yatt") SELECT "agent", "aholi", "ayol", "color", "createdAt", "drayver", "erkak", "id", "image", "mapPoints", "nomi", "oila", "sector", "tadbirkorlik", "tashkil", "updatedAt", "vakansiya", "xonadon", "yatt" FROM "Mahalla";
DROP TABLE "Mahalla";
ALTER TABLE "new_Mahalla" RENAME TO "Mahalla";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
