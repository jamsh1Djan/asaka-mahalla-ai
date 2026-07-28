import "server-only";
import { prisma } from "@/lib/prisma";
import { isAdmin, isBanker, type Session } from "@/lib/auth";

export async function canEditMahalla(session: Session | null, mahallaId: string): Promise<boolean> {
  if (isAdmin(session)) return true;
  if (!isBanker(session)) return false;
  const link = await prisma.bankerMahalla.findUnique({
    where: { bankerId_mahallaId: { bankerId: session.bankerId, mahallaId } },
  });
  return !!link;
}
