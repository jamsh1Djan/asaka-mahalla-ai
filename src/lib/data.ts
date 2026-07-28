// Static reference data: credit products & PQ-49 imtiyozlar are fixed catalogue
// content (not editable in the admin panel per the spec), so they live in code
// rather than the database — same as mahalla map polygon layout (illustrative,
// not to geo-scale, ported from the prototype).

export type CreditProduct = {
  id: string;
  tag: "Jismoniy shaxslar" | "Yuridik shaxslar";
  nomi: string;
  miqdori: string;
  /** Upper bound of the loan amount in so'm, used for deterministic matching against a
   * business idea's startup cost (see pickCreditProduct below). The export product's
   * $2M ceiling is modeled as a large sentinel — it is not meant to be matched against
   * typical small mahalla-level business ideas. */
  miqdoriSom: number;
  muddati: string;
  foiz: string;
  taminot: string;
  maqsad: string;
};

export const CREDIT_PRODUCTS: CreditProduct[] = [
  {
    id: "birinchi-qadam-1",
    tag: "Jismoniy shaxslar",
    nomi: "Biznesga birinchi qadam 1.0",
    miqdori: "5 mln so'mgacha",
    miqdoriSom: 5_000_000,
    muddati: "12 oygacha",
    foiz: "24%–28%",
    taminot: "Talab qilinmaydi",
    maqsad:
      "Ijtimoiy soliq to'lovchi, o'zini o'zi band qilgan jismoniy shaxslarni qo'llab-quvvatlash",
  },
  {
    id: "birinchi-qadam-2",
    tag: "Jismoniy shaxslar",
    nomi: "Biznesga birinchi qadam 2.0",
    miqdori: "17 mln so'mgacha",
    miqdoriSom: 17_000_000,
    muddati: "36 oygacha",
    foiz: "27%",
    taminot: "3-shaxs kafilligi yoki sug'urta polis",
    maqsad: "Asakabank biriktirilgan MFYlarda ro'yxatdagi ijtimoiy soliq to'lovchi shaxslar",
  },
  {
    id: "tadbirkorga-komak",
    tag: "Jismoniy shaxslar",
    nomi: "Tadbirkorga ko'mak",
    miqdori: "25 mln so'mgacha",
    miqdoriSom: 25_000_000,
    muddati: "36 oygacha",
    foiz: "25%",
    taminot: "3-shaxs kafilligi yoki sug'urta polis",
    maqsad: "Bank kartasidan muntazam foydalanuvchi, band shaxslarni qo'llab-quvvatlash",
  },
  {
    id: "mahalla-loyihasi",
    tag: "Yuridik shaxslar",
    nomi: "Mahalla loyihasi",
    miqdori: "50 mln so'mgacha",
    miqdoriSom: 50_000_000,
    muddati: "3 yilgacha",
    foiz: "25%",
    taminot: "3-shaxs kafilligi yoki sug'urta polis",
    maqsad: "O'z biznes loyihasini muvaffaqiyatli amalga oshirgan tadbirkorlik subyektlari",
  },
  {
    id: "biznesga-ishonch-2",
    tag: "Yuridik shaxslar",
    nomi: "Biznesga ishonch 2 (PQ-312)",
    miqdori: "300 mln so'mgacha",
    miqdoriSom: 300_000_000,
    muddati: "7 yilgacha",
    foiz: "19%–23%",
    taminot: "100 mln gacha garovsiz",
    maqsad: "Kamida 1 yil faoliyat yuritayotgan kichik tadbirkorlik subyektlari",
  },
  {
    id: "tomorqadan-eksportgacha",
    tag: "Yuridik shaxslar",
    nomi: "Tomorqadan eksportgacha",
    miqdori: "2 mln $ gacha",
    miqdoriSom: 10_000_000_000,
    muddati: "12 oygacha",
    foiz: "5%",
    taminot: "3-shaxs kafilligi yoki sug'urta polis",
    maqsad: "Eksport qiluvchi tadbirkorlik subyektlari",
  },
];

/** Deterministically picks the smallest credit product whose limit covers the given
 * startup cost — grounds the AI planner's "mos kredit" answer in real numeric logic
 * instead of leaving loan selection to free-text model output. */
export function pickCreditProduct(costSom: number): CreditProduct {
  const sorted = [...CREDIT_PRODUCTS].sort((a, b) => a.miqdoriSom - b.miqdoriSom);
  return sorted.find((p) => p.miqdoriSom >= costSom) ?? sorted[sorted.length - 1];
}

export const IMTIYOZLAR = [
  {
    num: "50 mln",
    txt: "O'zini o'zi band qilgan shaxslarga garov ta'minotisiz kreditlar",
  },
  {
    num: "100 mln",
    txt: "Chorvachilikka ixtisoslashgan mahallalarda naslli chorva moli xaridi va tuyachilik uchun kreditlar",
  },
  {
    num: "1000 mln",
    txt: "Chegara va anklav hududlardagi mahallalarda turizm va xizmat ko'rsatish tadbirkorlariga kreditlar",
  },
  {
    num: "150 mln",
    txt: "Turizm salohiyati yuqori mahallalarda uy-mehmonxonalari tashkil qilish uchun kreditlar (garovsiz)",
  },
  {
    num: "150 mln",
    txt: "Ixtisoslashuvi 50%dan yuqori mahallada mahsulot saqlash/qayta ishlash minitexnologiyalari uchun kredit (garovsiz)",
  },
  {
    num: "12% yillik",
    txt: "Og'ir toifadagi tumanlarda oilaviy tadbirkorlikni rivojlantirish dasturlari doirasidagi kreditlar",
  },
];

// SVG polygon point lists (viewBox 0 0 520 400), illustrative district segmentation.
export const MAP_LAYOUT: Record<string, string> = {
  otchopar1: "180,40 300,20 340,110 260,150 160,130",
  otchopar2: "300,20 430,45 440,140 340,110",
  yurtobod: "440,140 470,240 380,270 340,180 260,150 340,110",
  oqtepa: "160,130 260,150 340,180 300,270 190,260 130,210",
  muruvvat: "40,150 160,130 130,210 60,240",
  posira: "60,240 130,210 190,260 170,340 70,340",
  yangiariq: "170,340 190,260 300,270 380,270 340,360 220,380",
};
