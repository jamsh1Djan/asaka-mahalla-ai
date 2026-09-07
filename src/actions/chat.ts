"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { pickCreditProductForRequest, type EmploymentStatus } from "@/lib/data";

export type MahallaOption = {
  id: string;
  nomi: string;
  bankerName: string | null;
  bankerPhone: string | null;
  bankerTelegram: string | null;
};

/** The 7 real mahallas with their currently-assigned banker (if any) — used by
 * every branch of the chat widget that needs a mahalla picker. */
export async function getMahallaOptionsAction(): Promise<MahallaOption[]> {
  const mahallas = await prisma.mahalla.findMany({
    where: { status: "FAOL" },
    orderBy: { nomi: "asc" },
    select: { id: true, nomi: true },
  });
  const links = await prisma.bankerMahalla.findMany({
    where: { mahallaId: { in: mahallas.map((m) => m.id) } },
    include: { banker: { select: { ism: true, telefon: true, telegram: true } } },
  });
  const bankerByMahalla = new Map(links.map((l) => [l.mahallaId, l.banker]));
  return mahallas.map((m) => {
    const b = bankerByMahalla.get(m.id);
    return {
      id: m.id,
      nomi: m.nomi,
      bankerName: b?.ism ?? null,
      bankerPhone: b?.telefon ?? null,
      bankerTelegram: b?.telegram ?? null,
    };
  });
}

export type CreditMatchResult = {
  creditNomi: string;
  creditMiqdori: string;
  creditFoiz: string;
  requiredDocuments: string[];
  bankerName: string | null;
  bankerPhone: string | null;
  mahallaNomi: string;
  mahallaId: string;
};

/** Rule-based "niyatni aniqlash" (intent) + matching, per the button-driven flow:
 * amount + employment status + mahalla in, a grounded credit product + real document
 * checklist + assigned banker out. Nothing here is generated — every field traces back
 * to CREDIT_PRODUCTS or the BankerMahalla assignment table. */
export async function matchCreditAction(
  requestedAmount: number,
  employment: EmploymentStatus,
  mahallaId: string
): Promise<CreditMatchResult | { error: string }> {
  const mahalla = await prisma.mahalla.findUnique({ where: { id: mahallaId } });
  if (!mahalla) return { error: "Mahalla topilmadi" };

  const credit = pickCreditProductForRequest(requestedAmount, employment);

  const link = await prisma.bankerMahalla.findFirst({
    where: { mahallaId },
    include: { banker: { select: { ism: true, telefon: true } } },
  });

  try {
    const session = await getSession();
    const citizen = session?.kind === "fuqaro" ? session : null;
    await prisma.creditChatRequest.create({
      data: {
        mahallaId,
        requestedAmount,
        employmentStatus: employment,
        matchedCreditId: credit.id,
        citizenName: citizen?.name ?? null,
        citizenPhone: citizen?.phone ?? null,
      },
    });
  } catch {
    // best-effort logging only — never blocks the chat flow
  }

  return {
    creditNomi: credit.nomi,
    creditMiqdori: credit.miqdori,
    creditFoiz: credit.foiz,
    requiredDocuments: credit.requiredDocuments,
    bankerName: link?.banker.ism ?? null,
    bankerPhone: link?.banker.telefon ?? null,
    mahallaNomi: mahalla.nomi,
    mahallaId: mahalla.id,
  };
}
