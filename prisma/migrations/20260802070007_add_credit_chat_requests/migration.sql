-- CreateTable
CREATE TABLE "CreditChatRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mahallaId" TEXT NOT NULL,
    "requestedAmount" INTEGER NOT NULL,
    "employmentStatus" TEXT NOT NULL,
    "matchedCreditId" TEXT NOT NULL,
    "citizenName" TEXT,
    "citizenPhone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditChatRequest_mahallaId_fkey" FOREIGN KEY ("mahallaId") REFERENCES "Mahalla" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
