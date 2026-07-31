"use server";

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { pickCreditProduct } from "@/lib/data";
import { BUSINESS_IDEAS } from "@/lib/businessIdeas";
import { fmt } from "@/lib/format";
import { getSystemSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";

export type BusinessIdea = {
  nomi: string;
  tavsif: string;
  boshlangich_xarajat: string;
  kutilayotgan_oylik_daromad: string;
  mos_kredit: string;
  /** Estimated monthly installment for the matched credit product, at its own
   * rate/term — computed with the same amortization formula as the loan
   * calculator (never left to the model), so the wizard can actually answer
   * "qancha to'lov, qancha vaqtda qutuladi" instead of just naming a product. */
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

function candidateIdeas(drayver: string, budgetLabel: string, soha: string) {
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
    return { idea, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const scoreById = Object.fromEntries(scored.map((s) => [s.idea.id, s.score]));
  return { pool: scored.slice(0, 12).map((s) => s.idea), scoreById };
}

function buildIdeaTool(candidateIds: string[]) {
  return {
    name: "tavsiya_tanlash",
    description:
      "Berilgan biznes-g'oyalar katalogidan foydalanuvchiga eng mos 2-3 tasini tanlash",
    input_schema: {
      type: "object" as const,
      properties: {
        tanlanganlar: {
          type: "array" as const,
          items: {
            type: "object" as const,
            properties: {
              id: { type: "string" as const, enum: candidateIds },
              izoh: {
                type: "string" as const,
                description:
                  "Ushbu g'oya nega aynan shu mahalla va foydalanuvchi uchun mos ekanligi haqida O'zbek tilida 1-2 gapli tushuntirish",
              },
            },
            required: ["id", "izoh"],
          },
          minItems: 2,
          maxItems: 3,
        },
      },
      required: ["tanlanganlar"],
    },
  };
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
    return { error: "AI biznes-reja tavsiyachisi hozircha administrator tomonidan o'chirilgan." };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      error: "AI xizmati sozlanmagan (ANTHROPIC_API_KEY yo'q). Administratorga murojaat qiling.",
    };
  }

  const mahalla = await prisma.mahalla.findUnique({ where: { id: mahallaId } });
  if (!mahalla) return { error: "Mahalla topilmadi" };

  const { pool: candidates, scoreById } = candidateIdeas(mahalla.drayver, budget, soha);
  if (candidates.length === 0) {
    return { error: "Bu byudjet uchun mos g'oya topilmadi. Boshqa byudjet tanlab ko'ring." };
  }

  const client = new Anthropic({ apiKey });
  const tool = buildIdeaTool(candidates.map((c) => c.id));

  const catalogText = candidates
    .map(
      (c) =>
        `- id="${c.id}" | ${c.nomi} (${c.soha}) | boshlang'ich xarajat: ${fmt(c.costMin)}-${fmt(c.costMax)} so'm | oylik daromad: ${fmt(c.incomeMin)}-${fmt(c.incomeMax)} so'm | ${c.tavsif}`
    )
    .join("\n");

  const systemPrompt = `Sen Asaka Mahalla AI platformasining biznes-reja maslahatchisisan. Faqat O'zbek tilida javob ber.

Senga QUYIDAGI tayyor va tekshirilgan biznes-g'oyalar katalogi berilgan — xarajat va daromad raqamlari allaqachon real bozor sharoitiga mos hisoblangan. SEN YANGI G'OYA O'YLAB TOPMAYSAN va raqamlarni o'zgartirmaysan — faqat shu katalogdan foydalanuvchiga ENG MOS 2-3 tasini tanlaysan va har biri uchun nega aynan shu mahalla va foydalanuvchi uchun mos ekanligini qisqa tushuntirasan.

Katalog:
${catalogText}`;

  const userPrompt = `Mahalla: ${mahalla.nomi}. Ixtisoslashuv/drayver: ${mahalla.drayver}. Mahalladagi tadbirkorlik subyektlari: ${mahalla.tadbirkorlik} (shundan YATT: ${mahalla.yatt}, MChJ: ${mahalla.mchj}). Mahallada mavjud faoliyat turlari: ${mahalla.faoliyatTurlari || "ma'lumot yo'q"}. Foydalanuvchi byudjeti: ${budget}. Tajribasi: ${tajriba}. Jamoa hajmi: ${jamoaHajmi}. Qiziqqan sohasi: ${soha === "avtomatik" ? "aniq belgilamagan, o'zing eng mosini tanla" : soha}.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1200,
      system: systemPrompt,
      tools: [tool],
      tool_choice: { type: "tool", name: "tavsiya_tanlash" },
      messages: [{ role: "user", content: userPrompt }],
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return { error: "AI tavsiyasini olishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring." };
    }

    const input = toolUse.input as { tanlanganlar: { id: string; izoh: string }[] };
    const ideas: BusinessIdea[] = input.tanlanganlar
      .map(({ id, izoh }) => {
        const template = BUSINESS_IDEAS.find((b) => b.id === id);
        if (!template) return null;
        const credit = pickCreditProduct(template.costMax);
        const { oylikTolov, oylar } = estimateRepayment(template.costMax, credit.foiz, credit.muddati);
        const idea: BusinessIdea = {
          nomi: template.nomi,
          tavsif: izoh || template.tavsif,
          boshlangich_xarajat: `${fmt(template.costMin)}–${fmt(template.costMax)} so'm`,
          kutilayotgan_oylik_daromad: `${fmt(template.incomeMin)}–${fmt(template.incomeMax)} so'm/oy`,
          mos_kredit: `${credit.nomi} (${credit.miqdori}, ${credit.foiz})`,
          oylik_tolov: `≈ ${fmt(oylikTolov)} so'm/oy`,
          qaytarish_muddati: `${oylar} oyda to'liq qaytariladi`,
        };
        return idea;
      })
      .filter((x): x is BusinessIdea => x !== null);

    if (ideas.length === 0) {
      return { error: "AI tavsiyasini olishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring." };
    }

    const matched = input.tanlanganlar.some(({ id }) => (scoreById[id] ?? 0) >= 1);
    await logBusinessPlanRequest({ mahallaId, soha, budget, tajriba, jamoaHajmi, matched });

    return { ideas, matched };
  } catch {
    return { error: "AI tavsiyasini olishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring." };
  }
}
