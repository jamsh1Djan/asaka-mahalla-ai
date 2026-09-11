-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "businessId" TEXT,
ADD COLUMN     "maoshMax" INTEGER,
ADD COLUMN     "maoshMin" INTEGER,
ADD COLUMN     "talablar" TEXT;

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "mahallaId" TEXT NOT NULL,
    "nomi" TEXT NOT NULL,
    "turi" TEXT NOT NULL,
    "manzil" TEXT NOT NULL,
    "telefon" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_mahallaId_fkey" FOREIGN KEY ("mahallaId") REFERENCES "Mahalla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Banker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
