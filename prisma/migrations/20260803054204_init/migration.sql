-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BANKER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('YANGI', 'KORIB', 'BOG');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('IJARA', 'ISH', 'BOSHQA');

-- CreateEnum
CREATE TYPE "MahallaStatus" AS ENUM ('FAOL', 'FAOL_EMAS');

-- CreateEnum
CREATE TYPE "BankerStatus" AS ENUM ('FAOL', 'BLOKLANGAN');

-- CreateTable
CREATE TABLE "Mahalla" (
    "id" TEXT NOT NULL,
    "nomi" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "tuman" TEXT NOT NULL DEFAULT 'Yunusobod',
    "manzil" TEXT NOT NULL DEFAULT '',
    "status" "MahallaStatus" NOT NULL DEFAULT 'FAOL',
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mahalla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banker" (
    "id" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'BANKER',
    "status" "BankerStatus" NOT NULL DEFAULT 'FAOL',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "ism" TEXT NOT NULL,
    "telefon" TEXT,
    "telegram" TEXT,
    "ishVaqti" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "bankerId" TEXT,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginLog" (
    "id" TEXT NOT NULL,
    "bankerId" TEXT NOT NULL,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "LoginLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankerMahalla" (
    "bankerId" TEXT NOT NULL,
    "mahallaId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "BankerMahalla_pkey" PRIMARY KEY ("bankerId","mahallaId")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "mahallaId" TEXT NOT NULL,
    "fio" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "kredit" TEXT NOT NULL,
    "izoh" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'YANGI',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "mahallaId" TEXT NOT NULL,
    "turi" "ListingType" NOT NULL,
    "sarlavha" TEXT NOT NULL,
    "tavsif" TEXT NOT NULL,
    "narx" INTEGER,
    "manzil" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "amalMuddati" TIMESTAMP(3),
    "image" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessPlanRequest" (
    "id" TEXT NOT NULL,
    "mahallaId" TEXT NOT NULL,
    "soha" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "tajriba" TEXT NOT NULL,
    "jamoaHajmi" TEXT NOT NULL,
    "matched" BOOLEAN NOT NULL DEFAULT false,
    "citizenName" TEXT,
    "citizenPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessPlanRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditChatRequest" (
    "id" TEXT NOT NULL,
    "mahallaId" TEXT NOT NULL,
    "requestedAmount" INTEGER NOT NULL,
    "employmentStatus" TEXT NOT NULL,
    "matchedCreditId" TEXT NOT NULL,
    "citizenName" TEXT,
    "citizenPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditChatRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "aiPlannerYoqilgan" BOOLEAN NOT NULL DEFAULT true,
    "enforce2faForAdmins" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Banker_login_key" ON "Banker"("login");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_bankerId_fkey" FOREIGN KEY ("bankerId") REFERENCES "Banker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginLog" ADD CONSTRAINT "LoginLog_bankerId_fkey" FOREIGN KEY ("bankerId") REFERENCES "Banker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankerMahalla" ADD CONSTRAINT "BankerMahalla_bankerId_fkey" FOREIGN KEY ("bankerId") REFERENCES "Banker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankerMahalla" ADD CONSTRAINT "BankerMahalla_mahallaId_fkey" FOREIGN KEY ("mahallaId") REFERENCES "Mahalla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_mahallaId_fkey" FOREIGN KEY ("mahallaId") REFERENCES "Mahalla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_mahallaId_fkey" FOREIGN KEY ("mahallaId") REFERENCES "Mahalla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Banker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPlanRequest" ADD CONSTRAINT "BusinessPlanRequest_mahallaId_fkey" FOREIGN KEY ("mahallaId") REFERENCES "Mahalla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditChatRequest" ADD CONSTRAINT "CreditChatRequest_mahallaId_fkey" FOREIGN KEY ("mahallaId") REFERENCES "Mahalla"("id") ON DELETE CASCADE ON UPDATE CASCADE;
