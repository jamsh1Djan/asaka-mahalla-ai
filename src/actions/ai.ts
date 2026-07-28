"use server";

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { pickCreditProduct } from "@/lib/data";
import { BUSINESS_IDEAS } from "@/lib/businessIdeas";
import { fmt } from "@/lib/format";

export type BusinessIdea = {
  nomi: string;
  tavsif: string;
  boshlangich_xarajat: string;
  kutilayotgan_oylik_daromad: string;
  mos_kredit: string;
};

export type AiPlannerResult = { ideas: BusinessIdea[] } | { error: string };

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
  return scored.slice(0, 12).map((s) => s.idea);
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

export async function getBusinessIdeasAction(
  mahallaId: string,
  budget: string,
  tajriba: string,
  soha: string = "avtomatik"
): Promise<AiPlannerResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      error: "AI xizmati sozlanmagan (ANTHROPIC_API_KEY yo'q). Administratorga murojaat qiling.",
    };
  }

  const mahalla = await prisma.mahalla.findUnique({ where: { id: mahallaId } });
  if (!mahalla) return { error: "Mahalla topilmadi" };

  const candidates = candidateIdeas(mahalla.drayver, budget, soha);
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

  const userPrompt = `Mahalla: ${mahalla.nomi}. Ixtisoslashuv/drayver: ${mahalla.drayver}. Mahalladagi tadbirkorlik subyektlari: ${mahalla.tadbirkorlik} (shundan YATT: ${mahalla.yatt}, MChJ: ${mahalla.mchj}). Mahallada mavjud faoliyat turlari: ${mahalla.faoliyatTurlari || "ma'lumot yo'q"}. Foydalanuvchi byudjeti: ${budget}. Tajribasi: ${tajriba}. Qiziqqan sohasi: ${soha === "avtomatik" ? "aniq belgilamagan, o'zing eng mosini tanla" : soha}.`;

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
        const idea: BusinessIdea = {
          nomi: template.nomi,
          tavsif: izoh || template.tavsif,
          boshlangich_xarajat: `${fmt(template.costMin)}–${fmt(template.costMax)} so'm`,
          kutilayotgan_oylik_daromad: `${fmt(template.incomeMin)}–${fmt(template.incomeMax)} so'm/oy`,
          mos_kredit: `${credit.nomi} (${credit.miqdori}, ${credit.foiz})`,
        };
        return idea;
      })
      .filter((x): x is BusinessIdea => x !== null);

    if (ideas.length === 0) {
      return { error: "AI tavsiyasini olishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring." };
    }

    return { ideas };
  } catch {
    return { error: "AI tavsiyasini olishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring." };
  }
}
