import "server-only";
import { prisma } from "@/lib/prisma";
import { getClientIp, getUserAgent } from "@/lib/requestInfo";

/** Opens a new session record at login. Returns its id so logout can close it. */
export async function openLoginLog(bankerId: string): Promise<string | null> {
  try {
    const [ipAddress, userAgent] = await Promise.all([getClientIp(), getUserAgent()]);
    const log = await prisma.loginLog.create({
      data: { bankerId, ipAddress, userAgent },
    });
    return log.id;
  } catch {
    return null;
  }
}

/** Best-effort — closing the session record must never block logout itself. */
export async function closeLoginLog(loginLogId: string | null | undefined) {
  if (!loginLogId) return;
  try {
    await prisma.loginLog.update({
      where: { id: loginLogId },
      data: { logoutAt: new Date() },
    });
  } catch {
    // ignore — the row may already be gone (banker deleted), that's fine
  }
}
