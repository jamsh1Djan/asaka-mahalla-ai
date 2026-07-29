-- CreateTable
CREATE TABLE "LoginLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bankerId" TEXT NOT NULL,
    "loginAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutAt" DATETIME,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    CONSTRAINT "LoginLog_bankerId_fkey" FOREIGN KEY ("bankerId") REFERENCES "Banker" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Banker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "login" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'BANKER',
    "status" TEXT NOT NULL DEFAULT 'FAOL',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "ism" TEXT NOT NULL,
    "telefon" TEXT,
    "telegram" TEXT,
    "ishVaqti" TEXT,
    "lastLoginAt" DATETIME,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Banker" ("createdAt", "id", "ishVaqti", "ism", "login", "passwordHash", "role", "telefon", "telegram", "updatedAt") SELECT "createdAt", "id", "ishVaqti", "ism", "login", "passwordHash", "role", "telefon", "telegram", "updatedAt" FROM "Banker";
DROP TABLE "Banker";
ALTER TABLE "new_Banker" RENAME TO "Banker";
CREATE UNIQUE INDEX "Banker_login_key" ON "Banker"("login");
CREATE TABLE "new_BankerMahalla" (
    "bankerId" TEXT NOT NULL,
    "mahallaId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    PRIMARY KEY ("bankerId", "mahallaId"),
    CONSTRAINT "BankerMahalla_bankerId_fkey" FOREIGN KEY ("bankerId") REFERENCES "Banker" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BankerMahalla_mahallaId_fkey" FOREIGN KEY ("mahallaId") REFERENCES "Mahalla" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BankerMahalla" ("bankerId", "mahallaId") SELECT "bankerId", "mahallaId" FROM "BankerMahalla";
DROP TABLE "BankerMahalla";
ALTER TABLE "new_BankerMahalla" RENAME TO "BankerMahalla";
CREATE TABLE "new_Mahalla" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomi" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "tuman" TEXT NOT NULL DEFAULT 'Yunusobod',
    "manzil" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'FAOL',
    "isSeed" BOOLEAN NOT NULL DEFAULT false,
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
    "mapPoints" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Mahalla" ("agent", "aholi", "ayol", "color", "createdAt", "drayver", "erkak", "faoliyatTurlari", "id", "image", "mapPoints", "mchj", "nomi", "oila", "sector", "tadbirkorlik", "tashkil", "updatedAt", "vakansiya", "xonadon", "yatt") SELECT "agent", "aholi", "ayol", "color", "createdAt", "drayver", "erkak", "faoliyatTurlari", "id", "image", "mapPoints", "mchj", "nomi", "oila", "sector", "tadbirkorlik", "tashkil", "updatedAt", "vakansiya", "xonadon", "yatt" FROM "Mahalla";
DROP TABLE "Mahalla";
ALTER TABLE "new_Mahalla" RENAME TO "Mahalla";
CREATE TABLE "new_SystemSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "aiPlannerYoqilgan" BOOLEAN NOT NULL DEFAULT true,
    "enforce2faForAdmins" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SystemSettings" ("aiPlannerYoqilgan", "id", "updatedAt") SELECT "aiPlannerYoqilgan", "id", "updatedAt" FROM "SystemSettings";
DROP TABLE "SystemSettings";
ALTER TABLE "new_SystemSettings" RENAME TO "SystemSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
