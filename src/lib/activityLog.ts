import "server-only";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/requestInfo";

/** Best-effort activity log write — logging must never break the action it's
 * attached to, and (since every DB round trip here is real, remote latency,
 * not free) must never make the user wait on it either. after() runs this
 * once the response is already on its way back to the client — reading
 * headers() inside it is fine because every call site is a Server Action,
 * where after() explicitly supports request APIs directly in the callback. */
export async function logActivity(bankerId: string | null, action: string, detail?: string) {
  after(async () => {
    try {
      const ipAddress = await getClientIp();
      await prisma.activityLog.create({
        data: { bankerId, action, detail: detail ?? null, ipAddress },
      });
    } catch {
      // logging is best-effort, never block the primary action on it
    }
  });
}
