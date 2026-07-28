-- CreateTable
CREATE TABLE "Mahalla" (
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
    "vakansiya" INTEGER NOT NULL,
    "drayver" TEXT NOT NULL,
    "agent" TEXT NOT NULL,
    "image" TEXT,
    "color" TEXT NOT NULL,
    "mapPoints" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Banker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "login" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'BANKER',
    "ism" TEXT NOT NULL,
    "telefon" TEXT,
    "telegram" TEXT,
    "ishVaqti" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BankerMahalla" (
    "bankerId" TEXT NOT NULL,
    "mahallaId" TEXT NOT NULL,

    PRIMARY KEY ("bankerId", "mahallaId"),
    CONSTRAINT "BankerMahalla_bankerId_fkey" FOREIGN KEY ("bankerId") REFERENCES "Banker" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BankerMahalla_mahallaId_fkey" FOREIGN KEY ("mahallaId") REFERENCES "Mahalla" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mahallaId" TEXT NOT NULL,
    "fio" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "kredit" TEXT NOT NULL,
    "izoh" TEXT,
    "status" TEXT NOT NULL DEFAULT 'YANGI',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Application_mahallaId_fkey" FOREIGN KEY ("mahallaId") REFERENCES "Mahalla" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Banker_login_key" ON "Banker"("login");
