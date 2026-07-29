import "server-only";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/requestInfo";

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
