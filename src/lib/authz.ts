import "server-only";
import { prisma } from "@/lib/prisma";
import { isBanker, type Session } from "@/lib/auth";

export async function canEditMahalla(session: Session | null, mahallaId: string): Promise<boolean> {
  if (!isBanker(session)) return false;
  if (session.role === "ADMIN") return true;

  const link = await prisma.bankerMahalla.findUnique({
    where: { bankerId_mahallaId: { bankerId: session.bankerId, mahallaId } },
  });
  return !!link;
}
