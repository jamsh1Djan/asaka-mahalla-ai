"use server";

import { prisma } from "@/lib/prisma";
import { pickCreditProduct } from "@/lib/data";
import { BUSINESS_IDEAS, type BusinessIdeaTemplate } from "@/lib/businessIdeas";
import { fmt } from "@/lib/format";
import { getSystemSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import type { Mahalla } from "@prisma/client";

export type BusinessIdea = {
  nomi: string;
  tavsif: string;
  boshlangich_xarajat: string;
  kutilayotgan_oylik_daromad: string;
  mos_kredit: string;
  /** Estimated monthly installment for the matched credit product, at its own
   * rate/term — computed with the same amortization formula as the loan
   * calculator, so the wizard can actually answer "qancha to'lov, qancha
   * vaqtda qutuladi" instead of just naming a product. */
  oylik_tolov: string;
  qaytarish_muddati: string;
};

/** Standard amortizing-loan monthly payment, at the credit product's own
 * rate and term, using the idea's max startup cost as the borrowed amount —
 * same formula Calculator.tsx uses, so figures shown here and on the
 * calculator page never disagree. */
function estimateRepayment(amount: number, foizLabel: string, muddatiLabel: string) {
  const rateMatches = foizLabel.match(/\d+/g);
  const rate = rateMatches ? Number(rateMatches[rateMatches.length - 1]) : 25;
  const monthMatches = muddatiLabel.match(/\d+/g);
  const months = monthMatches ? Number(monthMatches[0]) : 24;
  const monthlyRate = rate / 100 / 12;
  const payment =
    monthlyRate > 0
      ? (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
      : amount / months;
  return { oylikTolov: Math.round(payment), oylar: months };
}

/** `matched` — whether the selected ideas actually have a real tie to this
 * mahalla's PQ-49 specialization (soha match or drayver keyword overlap),
 * vs. a generic catalogue pick shown because nothing local fit well. Drives
 * whether the UI labels the results "mahallangizga maxsus" or "standart". */
export type AiPlannerResult = { ideas: BusinessIdea[]; matched: boolean } | { error: string };

const BUDGET_RANGES: Record<string, [number, number]> = {
  "5 mln gacha": [0, 5_000_000],
  "5-20 mln": [5_000_000, 20_000_000],
  "20-50 mln": [20_000_000, 50_000_000],
  "50 mln dan ko'p": [50_000_000, 300_000_000],
};

/** Rule-based matching against the fixed BUSINESS_IDEAS catalogue — no
 * external API call, so this has no per-request cost and nothing to
 * misconfigure. Scores every candidate on soha match, mahalla-drayver
 * keyword overlap, and stated experience level, then returns the top picks
 * sorted best-first alongside each one's score (used for the "matched"
 * label). */
function candidateIdeas(drayver: string, budgetLabel: string, soha: string, tajriba: string) {
  const range = BUDGET_RANGES[budgetLabel] ?? BUDGET_RANGES["5-20 mln"];
  const drayverLower = drayver.toLowerCase();

  const overlapping = BUSINESS_IDEAS.filter(
    (idea) => idea.costMin <= range[1] && idea.costMax >= range[0]
  );
  const pool = overlapping.length >= 4 ? overlapping : BUSINESS_IDEAS;

  const scored = pool.map((idea) => {
    let score = 0;
    if (soha !== "avtomatik" && idea.soha === soha) score += 2;
    if (idea.drayverKalitlari.some((k) => drayverLower.includes(k))) score += 1;
    if (idea.tajriba === "Ikkalasi" || idea.tajriba === tajriba) score += 1;
    return { idea, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

/** Builds a short, grounded explanation from the same signals used to score
 * the idea — no free-text generation, just a template filled from real
 * fields, so it can never say something the data doesn't support. */
function explainIdea(idea: BusinessIdeaTemplate, mahalla: Mahalla, soha: string, tajriba: string): string {
  const reasons: string[] = [];
  if (soha !== "avtomatik" && idea.soha === soha) {
    reasons.push(`siz tanlagan "${soha}" sohasiga to'g'ridan-to'g'ri mos keladi`);
  }
  const drayverLower = mahalla.drayver.toLowerCase();
  if (idea.drayverKalitlari.some((k) => drayverLower.includes(k))) {
    reasons.push(`${mahalla.nomi} mahallasining asosiy yo'nalishi (${mahalla.drayver}) bilan bog'liq`);
  }
  if (idea.tajriba === tajriba) {
    reasons.push(`tajriba darajangizga (${tajriba.toLowerCase()}) mos keladi`);
  }
  const reasonText =
    reasons.length > 0
      ? `Bu g'oya ${reasons.join(" va ")}.`
      : `Kichik boshlang'ich kapital bilan boshlash mumkin bo'lgan ishonchli variant.`;
  return `${idea.tavsif} ${reasonText}`;
}

/** Best-effort survey log for the admin Statistika tab — never blocks or
 * fails the actual recommendation flow. */
async function logBusinessPlanRequest(data: {
  mahallaId: string;
  soha: string;
  budget: string;
  tajriba: string;
  jamoaHajmi: string;
  matched: boolean;
}) {
  try {
    const session = await getSession();
    const citizen = session?.kind === "fuqaro" ? session : null;
    await prisma.businessPlanRequest.create({
      data: {
        ...data,
        citizenName: citizen?.name ?? null,
        citizenPhone: citizen?.phone ?? null,
      },
    });
  } catch {
    // logging is not allowed to break the user-facing recommendation flow
  }
}

export async function getBusinessIdeasAction(
  mahallaId: string,
  budget: string,
  tajriba: string,
  soha: string = "avtomatik",
  jamoaHajmi: string = "Yolg'iz o'zim"
): Promise<AiPlannerResult> {
  const settings = await getSystemSettings();
  if (!settings.aiPlannerYoqilgan) {
    return { error: "Biznes-reja tavsiyachisi hozircha administrator tomonidan o'chirilgan." };
  }

  const mahalla = await prisma.mahalla.findUnique({ where: { id: mahallaId } });
  if (!mahalla) return { error: "Mahalla topilmadi" };

  const scored = candidateIdeas(mahalla.drayver, budget, soha, tajriba);
  if (scored.length === 0) {
    return { error: "Bu byudjet uchun mos g'oya topilmadi. Boshqa byudjet tanlab ko'ring." };
  }

  const picked = scored.slice(0, 3);
  const ideas: BusinessIdea[] = picked.map(({ idea: template }) => {
    const credit = pickCreditProduct(template.costMax);
    const { oylikTolov, oylar } = estimateRepayment(template.costMax, credit.foiz, credit.muddati);
    return {
      nomi: template.nomi,
      tavsif: explainIdea(template, mahalla, soha, tajriba),
      boshlangich_xarajat: `${fmt(template.costMin)}–${fmt(template.costMax)} so'm`,
      kutilayotgan_oylik_daromad: `${fmt(template.incomeMin)}–${fmt(template.incomeMax)} so'm/oy`,
      mos_kredit: `${credit.nomi} (${credit.miqdori}, ${credit.foiz})`,
      oylik_tolov: `≈ ${fmt(oylikTolov)} so'm/oy`,
      qaytarish_muddati: `${oylar} oyda to'liq qaytariladi`,
    };
  });

  const matched = picked.some(({ score }) => score >= 1);
  await logBusinessPlanRequest({ mahallaId, soha, budget, tajriba, jamoaHajmi, matched });

  return { ideas, matched };
}
