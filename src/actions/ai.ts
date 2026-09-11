"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { pickCreditProduct } from "@/lib/data";
import { BUSINESS_IDEAS, type BusinessIdeaTemplate, type Soha } from "@/lib/businessIdeas";
import { fmt } from "@/lib/format";
import { getSystemSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import type { Mahalla } from "@prisma/client";

export type CostItem = { nomi: string; summa: string };
export type MonthProjection = {
  oy: number;
  daromad: string;
  xarajat: string;
  sofFoyda: string;
  kumulyativ: string;
  ustida: boolean;
};

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
  // ---- Full plan (all formula-derived from the catalogue + real mahalla
  // stats — no free-text generation, so every number here is reproducible
  // and never disagrees with the summary fields above). ----
  xarajat_tafsiloti: CostItem[];
  oylik_xarajat_tafsiloti: CostItem[];
  sof_oylik_foyda: string;
  breakeven_oylar: string;
  yillik_prognoz: MonthProjection[];
  xavflar: string[];
  qadamlar: string[];
  raqobat: string;
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

// ---------------------------------------------------------------------------
// Financial-plan engine — every figure below is derived by formula from the
// catalogue's own cost/income range plus (for "raqobat") the mahalla's real
// stats already in the DB. Nothing here is free-generated text; the weights
// are documented assumptions (rent deposit, COGS ratio, etc.) typical for a
// small business of that type, not per-idea guesses.
// ---------------------------------------------------------------------------

/** How a startup budget typically splits by category, per soha. Each array
 * sums to 1 — multiplied by the idea's own costMax to get real so'm amounts. */
const COST_BREAKDOWN_BY_SOHA: Record<Soha, { nomi: string; ulush: number }[]> = {
  "Xizmat ko'rsatish": [
    { nomi: "Jihoz va asbob-uskunalar", ulush: 0.4 },
    { nomi: "Ijara uchun garov (2-3 oylik)", ulush: 0.2 },
    { nomi: "Ta'mirlash va joy tayyorlash", ulush: 0.15 },
    { nomi: "Ro'yxatdan o'tish va reklama", ulush: 0.1 },
    { nomi: "Aylanma mablag' (zaxira)", ulush: 0.15 },
  ],
  Savdo: [
    { nomi: "Boshlang'ich tovar zaxirasi", ulush: 0.45 },
    { nomi: "Do'kon jihozlari (javon, tarozi, kassa)", ulush: 0.2 },
    { nomi: "Ijara uchun garov", ulush: 0.15 },
    { nomi: "Ro'yxatdan o'tish va reklama", ulush: 0.05 },
    { nomi: "Aylanma mablag' (zaxira)", ulush: 0.15 },
  ],
  "Oziq-ovqat": [
    { nomi: "Oshxona/pishirish jihozlari", ulush: 0.35 },
    { nomi: "Boshlang'ich xom-ashyo zaxirasi", ulush: 0.25 },
    { nomi: "Ijara va sanitariya talablari", ulush: 0.15 },
    { nomi: "Ro'yxatdan o'tish, sanitariya ruxsatnomasi", ulush: 0.1 },
    { nomi: "Aylanma mablag' (zaxira)", ulush: 0.15 },
  ],
  "Ishlab chiqarish": [
    { nomi: "Ishlab chiqarish uskunalari", ulush: 0.5 },
    { nomi: "Boshlang'ich xom-ashyo", ulush: 0.2 },
    { nomi: "Joy ijarasi/tayyorlash", ulush: 0.12 },
    { nomi: "Ro'yxatdan o'tish va sertifikatlash", ulush: 0.08 },
    { nomi: "Aylanma mablag' (zaxira)", ulush: 0.1 },
  ],
  "Qishloq xo'jaligi": [
    { nomi: "Urug'lik/chorva/ko'chat xarajati", ulush: 0.35 },
    { nomi: "Asbob-uskuna va inventar", ulush: 0.25 },
    { nomi: "Yer/issiqxona tayyorlash", ulush: 0.2 },
    { nomi: "Ro'yxatdan o'tish va sug'urta", ulush: 0.05 },
    { nomi: "Aylanma mablag' (zaxira)", ulush: 0.15 },
  ],
  Qurilish: [
    { nomi: "Asbob-uskuna va texnika ijarasi", ulush: 0.4 },
    { nomi: "Boshlang'ich material zaxirasi", ulush: 0.25 },
    { nomi: "Litsenziya va ruxsatnomalar", ulush: 0.1 },
    { nomi: "Transport xarajatlari", ulush: 0.1 },
    { nomi: "Aylanma mablag' (zaxira)", ulush: 0.15 },
  ],
  "IT va raqamli xizmatlar": [
    { nomi: "Texnika (kompyuter, uskunalar)", ulush: 0.4 },
    { nomi: "Dastur va litsenziyalar", ulush: 0.15 },
    { nomi: "Ish joyi (ofis/coworking)", ulush: 0.15 },
    { nomi: "Marketing va veb-sayt", ulush: 0.15 },
    { nomi: "Aylanma mablag' (zaxira)", ulush: 0.15 },
  ],
  "Ta'lim": [
    { nomi: "O'quv materiallari va jihozlar", ulush: 0.3 },
    { nomi: "Xona ijarasi/tayyorlash", ulush: 0.25 },
    { nomi: "Litsenziya va ro'yxatdan o'tish", ulush: 0.1 },
    { nomi: "Marketing va reklama", ulush: 0.15 },
    { nomi: "Aylanma mablag' (zaxira)", ulush: 0.2 },
  ],
  "Turizm va mehmondo'stlik": [
    { nomi: "Jihoz va inventar", ulush: 0.35 },
    { nomi: "Joy ijarasi/ta'mirlash", ulush: 0.25 },
    { nomi: "Litsenziya va ruxsatnomalar", ulush: 0.1 },
    { nomi: "Marketing va reklama", ulush: 0.15 },
    { nomi: "Aylanma mablag' (zaxira)", ulush: 0.15 },
  ],
};

/** Share of monthly revenue that typically goes to operating costs (COGS +
 * rent + wages + tax), per soha — trade/food have high cost-of-goods, IT/
 * education/services run leaner. 1 minus this is the gross margin. */
const OPERATING_COST_RATIO: Record<Soha, number> = {
  "Xizmat ko'rsatish": 0.45,
  Savdo: 0.72,
  "Oziq-ovqat": 0.65,
  "Ishlab chiqarish": 0.6,
  "Qishloq xo'jaligi": 0.55,
  Qurilish: 0.58,
  "IT va raqamli xizmatlar": 0.35,
  "Ta'lim": 0.4,
  "Turizm va mehmondo'stlik": 0.55,
};

const RISKS_BY_SOHA: Record<Soha, string[]> = {
  "Xizmat ko'rsatish": [
    "Mijozlar oqimi barqaror bo'lmasligi mumkin — birinchi 2-3 oy reklamaga alohida e'tibor bering.",
    "Malakali usta/xodim topish qiyin bo'lishi mumkin.",
    "Raqobatchilar narxi pastroq bo'lishi mumkin — sifat va xizmat bilan farqlaning.",
  ],
  Savdo: [
    "Tovar qoldig'i sotilmay qolish xavfi (eskirish, mavsumiylik).",
    "Yetkazib beruvchi narxlari o'zgarishi marjani siqishi mumkin.",
    "Katta savdo nuqtalari/marketpleyslar bilan raqobat.",
  ],
  "Oziq-ovqat": [
    "Xom-ashyo narxi tez-tez o'zgaradi — narx siyosatini shunga moslashtiring.",
    "Sanitariya-epidemiologik talablarga rioya qilish shart, aks holda jarima xavfi bor.",
    "Mahsulot saqlash muddati qisqa — ortiqcha zaxira yo'qotish keltirib chiqaradi.",
  ],
  "Ishlab chiqarish": [
    "Uskunalar buzilishi ishlab chiqarishni to'xtatishi mumkin — texnik xizmat rejasini oldindan tuzing.",
    "Xom-ashyo yetkazib berishda uzilish xavfi.",
    "Sifat nazorati bo'lmasa qaytarilgan mahsulot xarajatlarni oshiradi.",
  ],
  "Qishloq xo'jaligi": [
    "Ob-havo va tabiiy omillarga bog'liqlik yuqori.",
    "Hosil/mahsulot sotish narxi mavsumga qarab keskin o'zgarishi mumkin.",
    "Sug'orish/saqlash infratuzilmasi yetarli bo'lmasa yo'qotish xavfi bor.",
  ],
  Qurilish: [
    "Loyihalar orasida uzilish (mavsumiylik) daromadni notekis qiladi.",
    "Material narxlari va yetkazib berish muddati o'zgarishi mumkin.",
    "Xavfsizlik qoidalariga rioya qilinmasa jarima yoki ish to'xtash xavfi.",
  ],
  "IT va raqamli xizmatlar": [
    "Birinchi mijozlarni topish vaqt talab qilishi mumkin — portfolio va tavsiyalar muhim.",
    "Texnologiya tez o'zgaradi — malakangizni doimiy yangilab turish kerak.",
    "Masofaviy raqobat (butun O'zbekiston/xorij) narxni pasaytirishi mumkin.",
  ],
  "Ta'lim": [
    "O'quvchi to'plash uchun ma'lum vaqt va obro' kerak bo'ladi.",
    "Mavsumiylik (o'quv yili, ta'til) daromadga ta'sir qiladi.",
    "Litsenziyalash talablariga rioya qilish zarur.",
  ],
  "Turizm va mehmondo'stlik": [
    "Mavsumiylik daromadni yil davomida notekis qiladi.",
    "Mijozlar sharhlari (reputatsiya) biznesga kuchli ta'sir qiladi.",
    "Xizmat sifati talablari yuqori — doimiy investitsiya talab qiladi.",
  ],
};

const STEPS_BY_SOHA: Record<Soha, string[]> = {
  "Xizmat ko'rsatish": [
    "YATT yoki MChJ sifatida ro'yxatdan o'ting (soliq.uz orqali onlayn, 1 kun)",
    "Joy tanlang va ijara shartnomasini rasmiylashtiring",
    "Zarur jihoz va asboblarni xarid qiling",
    "Kredit uchun ariza bering (quyidagi mos kredit turi bo'yicha)",
    "Xizmatlarni ijtimoiy tarmoqlarda va mahallada e'lon qiling",
    "Ochilish kunini rejalashtiring va birinchi mijozlarga chegirma taklif qiling",
  ],
  Savdo: [
    "YATT sifatida ro'yxatdan o'ting va kassa apparati (agar kerak bo'lsa) oling",
    "Savdo nuqtasini tanlang — odam ko'p o'tadigan joy afzal",
    "Yetkazib beruvchilar bilan kelishuv tuzing",
    "Boshlang'ich tovar zaxirasini xarid qiling",
    "Kredit uchun ariza bering (quyidagi mos kredit turi bo'yicha)",
    "Ochilishni mahallada e'lon qiling, birinchi hafta aksiya o'tkazing",
  ],
  "Oziq-ovqat": [
    "YATT/MChJ ro'yxatidan o'ting va sanitariya-epidemiologik xulosa oling",
    "Oshxona/savdo joyini tayyorlang (sanitariya talablariga mos)",
    "Jihoz va boshlang'ich xom-ashyoni xarid qiling",
    "Kredit uchun ariza bering (quyidagi mos kredit turi bo'yicha)",
    "Menyu/mahsulot ro'yxatini shakllantiring, narxlarni belgilang",
    "Ijtimoiy tarmoqlar va mahallada reklama qiling",
  ],
  "Ishlab chiqarish": [
    "MChJ sifatida ro'yxatdan o'ting, kerakli sertifikatlarni aniqlang",
    "Ishlab chiqarish joyini tanlang (kommunikatsiyalar mavjudligini tekshiring)",
    "Uskunalarni xarid qiling va o'rnating",
    "Kredit uchun ariza bering (quyidagi mos kredit turi bo'yicha)",
    "Xom-ashyo yetkazib beruvchilar bilan shartnoma tuzing",
    "Birinchi buyurtmalar/hamkorlarni toping (ulgurji savdo nuqtalari, do'konlar)",
  ],
  "Qishloq xo'jaligi": [
    "Fermer/YATT sifatida ro'yxatdan o'ting",
    "Yer uchastkasi yoki issiqxona joyini tayyorlang",
    "Urug'lik/ko'chat/chorva va inventarni xarid qiling",
    "Kredit uchun ariza bering (quyidagi mos kredit turi bo'yicha)",
    "Sug'orish va parvarish jadvalini tuzing",
    "Hosil/mahsulotni sotish uchun bozor yoki ulgurjichilar bilan oldindan kelishing",
  ],
  Qurilish: [
    "YATT/MChJ ro'yxatidan o'ting, kerakli ruxsatnomalarni aniqlang",
    "Asosiy asbob-uskuna va texnikani xarid qiling yoki ijaraga oling",
    "Kredit uchun ariza bering (quyidagi mos kredit turi bo'yicha)",
    "Birinchi buyurtmalarni mahalla e'lonlari va tanishlar orqali toping",
    "Xavfsizlik qoidalari va sifat nazoratini yo'lga qo'ying",
    "Bajarilgan ishlar portfoliosini yig'ib boring (keyingi buyurtmalar uchun)",
  ],
  "IT va raqamli xizmatlar": [
    "YATT sifatida ro'yxatdan o'ting (IT sohasida soliq imtiyozlari mavjud)",
    "Kerakli texnika va dasturiy ta'minotni tayyorlang",
    "Portfolio/namuna ishlaringizni tayyorlang",
    "Birinchi mijozlarni frilanser platformalar yoki mahalliy biznes orqali toping",
    "Kredit uchun ariza bering (agar texnika/ofis uchun kerak bo'lsa)",
    "Ijtimoiy tarmoq va veb-sayt orqali xizmatlaringizni tanishtiring",
  ],
  "Ta'lim": [
    "Ta'lim faoliyati uchun litsenziya/ro'yxatdan o'tishni aniqlang",
    "Dars o'tish joyini tayyorlang (yoki onlayn formatni tanlang)",
    "O'quv dasturi va narxlarni shakllantiring",
    "Kredit uchun ariza bering (quyidagi mos kredit turi bo'yicha)",
    "Birinchi guruhni mahalla va ijtimoiy tarmoqlar orqali to'plang",
    "O'quvchilar natijasini ko'rsatib, tavsiyalar orqali kengaying",
  ],
  "Turizm va mehmondo'stlik": [
    "YATT/MChJ ro'yxatidan o'ting, turizm faoliyati ruxsatnomasini aniqlang",
    "Joy/xizmat sifatini mehmon kutish darajasiga yetkazing",
    "Kredit uchun ariza bering (quyidagi mos kredit turi bo'yicha)",
    "Onlayn platformalarda (booking, ijtimoiy tarmoq) profil yarating",
    "Birinchi mehmonlar uchun maxsus taklif tayyorlang",
    "Sharhlarni yig'ib, xizmat sifatini doimiy oshirib boring",
  ],
};

/** Revenue ramp-up in the first year — a new small business rarely runs at
 * full capacity from month 1; this is the standard conservative curve used
 * across every idea (40% → 65% → 85% → 100% from month 4 on). */
const RAMP = [0.4, 0.65, 0.85, 1, 1, 1, 1, 1, 1, 1, 1, 1];

function buildCostBreakdown(soha: Soha, totalCost: number): CostItem[] {
  return COST_BREAKDOWN_BY_SOHA[soha].map((c) => ({
    nomi: c.nomi,
    summa: `${fmt(Math.round(totalCost * c.ulush))} so'm`,
  }));
}

function buildOperatingCosts(soha: Soha, monthlyIncomeAvg: number, hasTeam: boolean) {
  const ratio = OPERATING_COST_RATIO[soha];
  const totalMonthly = monthlyIncomeAvg * ratio;
  const fixedShare = hasTeam ? 0.55 : 0.4; // ijara + ish haqi (+ soliq) vs. pure COGS
  const fixedCost = totalMonthly * fixedShare;
  const variableCostFull = totalMonthly - fixedCost;

  const items: CostItem[] = [
    { nomi: "Xom-ashyo/tovar tannarxi", summa: `${fmt(Math.round(variableCostFull))} so'm` },
    { nomi: "Ijara va kommunal xizmatlar", summa: `${fmt(Math.round(fixedCost * 0.55))} so'm` },
  ];
  if (hasTeam) {
    items.push({ nomi: "Xodimlar ish haqi", summa: `${fmt(Math.round(fixedCost * 0.3))} so'm` });
    items.push({ nomi: "Soliq va boshqa xarajatlar", summa: `${fmt(Math.round(fixedCost * 0.15))} so'm` });
  } else {
    items.push({ nomi: "Soliq va boshqa xarajatlar", summa: `${fmt(Math.round(fixedCost * 0.45))} so'm` });
  }
  return { items, fixedCost, variableCostFull, totalMonthly };
}

function buildYearlyProjection(
  incomeAvg: number,
  fixedCost: number,
  variableCostFull: number,
  totalInvestment: number
): { yillik_prognoz: MonthProjection[]; breakeven_oylar: string } {
  let kumulyativ = -totalInvestment;
  let breakevenMonth: number | null = null;
  const rows: MonthProjection[] = RAMP.map((ramp, idx) => {
    const oy = idx + 1;
    const daromad = incomeAvg * ramp;
    const xarajat = fixedCost + variableCostFull * ramp;
    const sofFoyda = daromad - xarajat;
    kumulyativ += sofFoyda;
    if (breakevenMonth === null && kumulyativ >= 0) breakevenMonth = oy;
    return {
      oy,
      daromad: `${fmt(daromad)} so'm`,
      xarajat: `${fmt(xarajat)} so'm`,
      sofFoyda: `${fmt(sofFoyda)} so'm`,
      kumulyativ: `${fmt(kumulyativ)} so'm`,
      ustida: kumulyativ >= 0,
    };
  });

  let breakevenLabel: string;
  if (breakevenMonth !== null) {
    breakevenLabel = `${breakevenMonth}-oyda`;
  } else {
    // Extrapolate past month 12 using the steady-state (month-12) monthly profit.
    const steadyProfit = incomeAvg - (fixedCost + variableCostFull);
    if (steadyProfit > 0) {
      const extraMonths = Math.ceil(-kumulyativ / steadyProfit);
      breakevenLabel = `taxminan ${12 + extraMonths}-oyda`;
    } else {
      breakevenLabel = "1 yil ichida qoplanmaydi — byudjetni qayta ko'rib chiqing";
    }
  }
  return { yillik_prognoz: rows, breakeven_oylar: breakevenLabel };
}

/** Grounded in the mahalla's real, current stats (not the idea catalogue) —
 * population-per-registered-business is a real density signal already in
 * the DB for every mahalla, so this holds regardless of which soha or idea
 * is being shown. */
function buildCompetitionNote(mahalla: Mahalla): string {
  if (mahalla.tadbirkorlik <= 0) {
    return `${mahalla.nomi} mahallasida hozircha ro'yxatdan o'tgan tadbirkorlik subyektlari haqida yetarli ma'lumot yo'q.`;
  }
  const perBusiness = mahalla.aholi / mahalla.tadbirkorlik;
  let level: string;
  if (perBusiness > 150) level = "past — yangi biznes uchun imkoniyat katta";
  else if (perBusiness > 60) level = "o'rtacha";
  else level = "yuqori — sifat va narx bilan farqlanish muhim bo'ladi";
  return `${mahalla.nomi} mahallasida hozirda ${fmt(mahalla.tadbirkorlik)} ta ro'yxatdan o'tgan tadbirkorlik subyekti bor — har ${fmt(
    Math.round(perBusiness)
  )} aholiga taxminan 1 ta. Raqobat darajasi: ${level}.`;
}

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
 * fails the actual recommendation flow, and deferred via after() so its own
 * (real, remote) DB write doesn't add to the wait for a response the citizen
 * is actively looking at. */
function logBusinessPlanRequest(data: {
  mahallaId: string;
  soha: string;
  budget: string;
  tajriba: string;
  jamoaHajmi: string;
  matched: boolean;
}) {
  after(async () => {
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
  });
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

  // Up to 12 ranked ideas so the results screen can show a bigger grid with a
  // "Yana ko'rsat" (show more) button instead of always just a handful of
  // near-identical picks for every mahalla.
  const picked = scored.slice(0, 12);
  const hasTeam = jamoaHajmi !== "Yolg'iz o'zim";
  const competition = buildCompetitionNote(mahalla);
  const ideas: BusinessIdea[] = picked.map(({ idea: template }) => {
    const credit = pickCreditProduct(template.costMax);
    const { oylikTolov, oylar } = estimateRepayment(template.costMax, credit.foiz, credit.muddati);

    const incomeAvg = (template.incomeMin + template.incomeMax) / 2;
    const { items: oylik_xarajat_tafsiloti, fixedCost, variableCostFull } = buildOperatingCosts(
      template.soha,
      incomeAvg,
      hasTeam
    );
    const { yillik_prognoz, breakeven_oylar } = buildYearlyProjection(
      incomeAvg,
      fixedCost,
      variableCostFull,
      template.costMax
    );
    const sofOylikFoyda = incomeAvg - (fixedCost + variableCostFull);

    return {
      nomi: template.nomi,
      tavsif: explainIdea(template, mahalla, soha, tajriba),
      boshlangich_xarajat: `${fmt(template.costMin)}–${fmt(template.costMax)} so'm`,
      kutilayotgan_oylik_daromad: `${fmt(template.incomeMin)}–${fmt(template.incomeMax)} so'm/oy`,
      mos_kredit: `${credit.nomi} (${credit.miqdori}, ${credit.foiz})`,
      oylik_tolov: `≈ ${fmt(oylikTolov)} so'm/oy`,
      qaytarish_muddati: `${oylar} oyda to'liq qaytariladi`,
      xarajat_tafsiloti: buildCostBreakdown(template.soha, template.costMax),
      oylik_xarajat_tafsiloti,
      sof_oylik_foyda: `≈ ${fmt(sofOylikFoyda)} so'm/oy (kredit to'lovidan oldin)`,
      breakeven_oylar,
      yillik_prognoz,
      xavflar: RISKS_BY_SOHA[template.soha],
      qadamlar: STEPS_BY_SOHA[template.soha],
      raqobat: competition,
    };
  });

  const matched = (picked[0]?.score ?? 0) >= 1;
  await logBusinessPlanRequest({ mahallaId, soha, budget, tajriba, jamoaHajmi, matched });

  return { ideas, matched };
}
