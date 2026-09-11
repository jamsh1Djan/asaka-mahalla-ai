"use server";

import { after } from "next/server";
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
  // The bankerMahalla query used to filter by the mahalla IDs from the first
  // query, forcing them to run one after another — fetching all links
  // unconditionally (there are only ever a handful) removes that dependency
  // so both queries run together instead of paying their latency twice.
  const [mahallas, links] = await Promise.all([
    prisma.mahalla.findMany({
      where: { status: "FAOL" },
      orderBy: { nomi: "asc" },
      select: { id: true, nomi: true },
    }),
    prisma.bankerMahalla.findMany({
      include: { banker: { select: { ism: true, telefon: true, telegram: true } } },
    }),
  ]);
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
  // Neither of these depends on the other's result, so there's no reason to
  // pay their (real, remote) latency one after another.
  const [mahalla, link, session] = await Promise.all([
    prisma.mahalla.findUnique({ where: { id: mahallaId } }),
    prisma.bankerMahalla.findFirst({
      where: { mahallaId },
      include: { banker: { select: { ism: true, telefon: true } } },
    }),
    getSession(),
  ]);
  if (!mahalla) return { error: "Mahalla topilmadi" };

  const credit = pickCreditProductForRequest(requestedAmount, employment);

  // Best-effort logging only — never blocks the chat flow, and deferred so
  // its own DB write doesn't add to the wait for a response the citizen is
  // actively watching for.
  after(async () => {
    try {
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
  });

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
