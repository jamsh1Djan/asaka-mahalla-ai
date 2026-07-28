import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip");
}

/** Best-effort activity log write — logging must never break the action it's attached to. */
export async function logActivity(bankerId: string | null, action: string, detail?: string) {
  try {
    const ipAddress = await getClientIp();
    await prisma.activityLog.create({
      data: { bankerId, action, detail: detail ?? null, ipAddress },
    });
  } catch {
    // logging is best-effort, never block the primary action on it
  }
}
