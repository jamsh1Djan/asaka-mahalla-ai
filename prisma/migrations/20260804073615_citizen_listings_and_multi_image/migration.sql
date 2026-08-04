/*
  Warnings:

  - You are about to drop the column `image` on the `Listing` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('KUTILMOQDA', 'TASDIQLANGAN', 'RAD_ETILGAN');

-- CreateEnum
CREATE TYPE "ListingSource" AS ENUM ('BANKIR', 'FUQARO');

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "image",
ADD COLUMN     "citizenName" TEXT,
ADD COLUMN     "citizenPhone" TEXT,
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "rejectReason" TEXT,
ADD COLUMN     "source" "ListingSource" NOT NULL DEFAULT 'BANKIR',
ADD COLUMN     "status" "ListingStatus" NOT NULL DEFAULT 'TASDIQLANGAN',
ALTER COLUMN "createdBy" DROP NOT NULL;
