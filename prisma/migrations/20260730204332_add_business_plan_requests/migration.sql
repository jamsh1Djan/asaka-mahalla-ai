-- CreateTable
CREATE TABLE "BusinessPlanRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mahallaId" TEXT NOT NULL,
    "soha" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "tajriba" TEXT NOT NULL,
    "jamoaHajmi" TEXT NOT NULL,
    "matched" BOOLEAN NOT NULL DEFAULT false,
    "citizenName" TEXT,
    "citizenPhone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BusinessPlanRequest_mahallaId_fkey" FOREIGN KEY ("mahallaId") REFERENCES "Mahalla" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
