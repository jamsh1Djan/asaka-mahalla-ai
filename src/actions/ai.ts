"use server";

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { CREDIT_PRODUCTS } from "@/lib/data";

export type BusinessIdea = {
  nomi: string;
  tavsif: string;
  boshlangich_xarajat: string;
  kutilayotgan_oylik_daromad: string;
  mos_kredit: string;
};

export type AiPlannerResult = { ideas: BusinessIdea[] } | { error: string };

const IDEA_TOOL = {
  name: "taklif_qilish",
  description: "Foydalanuvchiga mahalla ixtisoslashuviga mos biznes g'oyalarini taklif qilish",
  input_schema: {
    type: "object" as const,
    properties: {
      gholar: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            nomi: { type: "string" as const },
            tavsif: { type: "string" as const },
            boshlangich_xarajat: { type: "string" as const },
            kutilayotgan_oylik_daromad: { type: "string" as const },
            mos_kredit: { type: "string" as const },
          },
          required: [
            "nomi",
            "tavsif",
            "boshlangich_xarajat",
            "kutilayotgan_oylik_daromad",
            "mos_kredit",
          ],
        },
        minItems: 2,
        maxItems: 3,
      },
    },
    required: ["gholar"],
  },
};

export async function getBusinessIdeasAction(
  mahallaId: string,
  budget: string,
  tajriba: string
): Promise<AiPlannerResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { error: "AI xizmati sozlanmagan (ANTHROPIC_API_KEY yo'q). Administratorga murojaat qiling." };
  }

  const mahalla = await prisma.mahalla.findUnique({ where: { id: mahallaId } });
  if (!mahalla) return { error: "Mahalla topilmadi" };

  const client = new Anthropic({ apiKey });

  const systemPrompt = `Sen Asaka Mahalla AI platformasining biznes-reja maslahatchisisan. Faqat O'zbek tilida javob ber. Foydalanuvchiga mahalla ixtisoslashuviga mos, REAL va tanqidiy asoslangan (haddan tashqari bo'rttirilmagan) 2-3 ta biznes g'oyasini tavsiya qil. Har bir g'oya uchun taxminiy boshlang'ich xarajat va kutilayotgan oylik daromadni so'mda taxminiy diapazon sifatida ko'rsat. Quyidagi mavjud kredit mahsulotlaridan foydalanuvchining byudjeti va daromadiga ENG MOS bo'lganini tanlab ko'rsat: ${CREDIT_PRODUCTS.map((c) => `${c.nomi} (${c.miqdori}, ${c.foiz})`).join("; ")}.`;

  const userPrompt = `Mahalla: ${mahalla.nomi}. Ixtisoslashuv/drayver: ${mahalla.drayver}. Mahalladagi tadbirkorlik subyektlari soni: ${mahalla.tadbirkorlik}. Foydalanuvchi byudjeti: ${budget}. Tajribasi: ${tajriba}.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1200,
      system: systemPrompt,
      tools: [IDEA_TOOL],
      tool_choice: { type: "tool", name: "taklif_qilish" },
      messages: [{ role: "user", content: userPrompt }],
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return { error: "AI tavsiyasini olishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring." };
    }

    const input = toolUse.input as { gholar: BusinessIdea[] };
    return { ideas: input.gholar };
  } catch {
    return { error: "AI tavsiyasini olishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring." };
  }
}
