-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mahallaId" TEXT NOT NULL,
    "turi" TEXT NOT NULL,
    "sarlavha" TEXT NOT NULL,
    "tavsif" TEXT NOT NULL,
    "narx" INTEGER,
    "manzil" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "amalMuddati" DATETIME,
    "image" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Listing_mahallaId_fkey" FOREIGN KEY ("mahallaId") REFERENCES "Mahalla" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Listing_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Banker" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "aiPlannerYoqilgan" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL
);
