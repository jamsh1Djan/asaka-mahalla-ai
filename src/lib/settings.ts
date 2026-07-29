import "server-only";
import { prisma } from "@/lib/prisma";

/** Singleton settings row (id=1) — created on first read if it doesn't exist yet. */
export async function getSystemSettings() {
  return prisma.systemSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}
