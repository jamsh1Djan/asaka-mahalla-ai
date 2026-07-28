-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bankerId" TEXT,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_bankerId_fkey" FOREIGN KEY ("bankerId") REFERENCES "Banker" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
