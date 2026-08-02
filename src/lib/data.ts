// Static reference data: credit products & PQ-49 imtiyozlar are fixed catalogue
// content (not editable in the admin panel per the spec), so they live in code
// rather than the database — same as mahalla map polygon layout (illustrative,
// not to geo-scale, ported from the prototype).

export type EmploymentStatus = "self_employed" | "employed" | "business_owner";

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
  /** Which employment/business situations this product actually targets — grounds the
   * chat widget's credit matching in the same real eligibility text as `maqsad`,
   * instead of guessing. */
  employmentTags: EmploymentStatus[];
  /** Real document checklist shown in the chat widget's "action card" — never invented
   * per-request, always this fixed list. */
  requiredDocuments: string[];
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
    employmentTags: ["self_employed"],
    requiredDocuments: [
      "Pasport",
      "Doimiy/vaqtinchalik ro'yxatdan o'tish (propiska) nusxasi",
      "Ijtimoiy soliq to'lovchi sifatida ro'yxatdan o'tganlik ma'lumotnomasi",
    ],
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
    employmentTags: ["self_employed"],
    requiredDocuments: [
      "Pasport",
      "Ijtimoiy soliq to'lovchi ma'lumotnomasi",
      "Kafil pasporti va roziligi (yoki sug'urta polis)",
      "Yashash manzilini tasdiqlovchi hujjat",
    ],
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
    employmentTags: ["employed"],
    requiredDocuments: [
      "Pasport",
      "Ish joyidan maosh haqida ma'lumotnoma",
      "Bank kartasi bo'yicha so'nggi 3-6 oylik hisobot",
      "Kafil pasporti va roziligi (yoki sug'urta polis)",
    ],
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
    employmentTags: ["business_owner"],
    requiredDocuments: [
      "Yuridik shaxs/YATT guvohnomasi",
      "Soliq organidan ma'lumotnoma",
      "Tayyor biznes-reja",
      "Kafil pasporti va roziligi (yoki sug'urta polis)",
    ],
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
    employmentTags: ["business_owner"],
    requiredDocuments: [
      "Yuridik shaxs/YATT guvohnomasi",
      "Kamida 1 yillik faoliyat statistikasi/moliyaviy hisobot",
      "Soliq organidan ma'lumotnoma",
      "100 mln so'mdan yuqori summalar uchun garov hujjatlari",
    ],
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
    employmentTags: ["business_owner"],
    requiredDocuments: [
      "Yuridik shaxs guvohnomasi",
      "Eksport shartnomasi (kontrakt)",
      "Soliq organidan ma'lumotnoma",
      "Bojxona deklaratsiyasi namunasi",
    ],
  },
];

/** Deterministically picks the smallest credit product whose limit covers the given
 * startup cost — grounds the business-plan wizard's "mos kredit" answer in real numeric
 * logic instead of leaving loan selection to free-text model output. */
export function pickCreditProduct(costSom: number): CreditProduct {
  const sorted = [...CREDIT_PRODUCTS].sort((a, b) => a.miqdoriSom - b.miqdoriSom);
  return sorted.find((p) => p.miqdoriSom >= costSom) ?? sorted[sorted.length - 1];
}

/** Same deterministic "smallest product that covers the amount" logic as
 * pickCreditProduct, but also prefers a product whose employmentTags include the
 * requester's stated situation — used by the button-driven chat widget's credit
 * matching (see AiChatWidget.tsx). Falls back to the plain amount-based pick if no
 * product tagged for that employment status covers the requested amount. */
export function pickCreditProductForRequest(
  amountSom: number,
  employment: EmploymentStatus
): CreditProduct {
  const sorted = [...CREDIT_PRODUCTS].sort((a, b) => a.miqdoriSom - b.miqdoriSom);
  const eligible = sorted.filter((p) => p.employmentTags.includes(employment));
  const fromEligible = eligible.find((p) => p.miqdoriSom >= amountSom);
  if (fromEligible) return fromEligible;
  return sorted.find((p) => p.miqdoriSom >= amountSom) ?? sorted[sorted.length - 1];
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

// Real Yandex Maps location links for each mahalla's fuqarolar yig'ini
// building, opened from the "Xaritada ko'rish" pill on its photo/card.
export const MAHALLA_YANDEX_LINKS: Record<string, string> = {
  otchopar1:
    "https://yandex.uz/maps/10335/tashkent/geo/1_otchopar_mahalla_fuqarolar_yig_ini/1946535121/?azimuth=0.8843134611974633&ll=69.297867%2C41.356365&tilt=0.8726646259971648&z=15.22",
  otchopar2:
    "https://yandex.uz/maps/10335/tashkent/geo/2_otchopar_mahalla_fuqarolar_yig_ini/1946531781/?azimuth=0.8843134611974633&ll=69.312098%2C41.353189&tilt=0.8726646259971648&z=13.75",
  oqtepa:
    "https://yandex.uz/maps/10335/tashkent/geo/oqtepa_mahalla_fuqarolar_yig_ini/1508577550/?azimuth=0.8843134611974633&ll=69.318023%2C41.362688&tilt=0.8726646259971648&z=13.71",
  muruvvat:
    "https://yandex.uz/maps/10335/tashkent/geo/muruvvat_mahalla_fuqarolar_yig_ini/1946553721/?azimuth=0.8843134611974633&ll=69.298979%2C41.378466&tilt=0.8726646259971648&z=15.59",
  posira:
    "https://yandex.uz/maps/10335/tashkent/geo/posira_mahalla_fuqarolar_yig_ini/1946494791/?azimuth=0.8843134611974633&ll=69.334817%2C41.356157&tilt=0.8726646259971648&z=14.21",
  yangiariq:
    "https://yandex.uz/maps/10335/tashkent/geo/yangi_ariq_mahalla_fuqarolar_yig_ini/1946475711/?l=sat&ll=69.272299%2C41.347239&source=serp_navig&z=16",
  yurtobod:
    "https://yandex.uz/maps/10335/tashkent/geo/yurtobod_mahalla_fuqarolar_yig_ini/1946549871/?l=sat&ll=69.317322%2C41.378131&source=serp_navig&z=17",
};

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
