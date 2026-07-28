// A fixed catalogue of ~30 small-business ideas with grounded, conservative cost/income
// ranges (so'm). The AI planner (see src/actions/ai.ts) selects the 2-3 best-fitting IDs
// from this catalogue instead of free-generating numbers — this is what keeps its answers
// "ishonchli va tekshirilgan asosda" (grounded, not hallucinated): the actual cost/income
// figures shown to the user always come from here, never from the model's own arithmetic.

export type Soha =
  | "Xizmat ko'rsatish"
  | "Savdo"
  | "Oziq-ovqat"
  | "Ishlab chiqarish"
  | "Qishloq xo'jaligi"
  | "Qurilish"
  | "IT va raqamli xizmatlar"
  | "Ta'lim"
  | "Turizm va mehmondo'stlik";

export const SOHALAR: Soha[] = [
  "Xizmat ko'rsatish",
  "Savdo",
  "Oziq-ovqat",
  "Ishlab chiqarish",
  "Qishloq xo'jaligi",
  "Qurilish",
  "IT va raqamli xizmatlar",
  "Ta'lim",
  "Turizm va mehmondo'stlik",
];

export type Tajriba = "Yangi boshlovchi" | "Tajribam bor" | "Ikkalasi";

export type BusinessIdeaTemplate = {
  id: string;
  nomi: string;
  soha: Soha;
  tavsif: string;
  costMin: number;
  costMax: number;
  incomeMin: number;
  incomeMax: number;
  /** Substrings matched (case-insensitively) against a mahalla's `drayver` text to judge
   * local fit — e.g. an idea tagged "xizmat" is boosted for a mahalla whose drayver
   * contains "xizmat ko'rsatish". */
  drayverKalitlari: string[];
  tajriba: Tajriba;
};

export const BUSINESS_IDEAS: BusinessIdeaTemplate[] = [
  // Xizmat ko'rsatish
  {
    id: "sartaroshxona",
    nomi: "Sartaroshxona / go'zallik saloni (mini)",
    soha: "Xizmat ko'rsatish",
    tavsif: "1-2 ustali kichik sartaroshxona yoki go'zallik xizmati shohobchasi.",
    costMin: 8_000_000,
    costMax: 18_000_000,
    incomeMin: 4_000_000,
    incomeMax: 9_000_000,
    drayverKalitlari: ["xizmat"],
    tajriba: "Ikkalasi",
  },
  {
    id: "tikish-tamirlash",
    nomi: "Kiyim tikish va ta'mirlash sexi",
    soha: "Xizmat ko'rsatish",
    tavsif: "Kiyim tikish, o'lchamga moslash va ta'mirlash xizmati ko'rsatuvchi kichik ustaxona.",
    costMin: 5_000_000,
    costMax: 12_000_000,
    incomeMin: 3_000_000,
    incomeMax: 7_000_000,
    drayverKalitlari: ["xizmat"],
    tajriba: "Tajribam bor",
  },
  {
    id: "poyabzal-tamirlash",
    nomi: "Poyabzal ta'mirlash ustaxonasi",
    soha: "Xizmat ko'rsatish",
    tavsif: "Poyabzal va charm buyumlarni ta'mirlash xizmati.",
    costMin: 3_000_000,
    costMax: 7_000_000,
    incomeMin: 2_500_000,
    incomeMax: 5_000_000,
    drayverKalitlari: ["xizmat", "savdo"],
    tajriba: "Yangi boshlovchi",
  },
  {
    id: "avto-yuvish",
    nomi: "Avtomobil yuvish shohobchasi (mini)",
    soha: "Xizmat ko'rsatish",
    tavsif: "Kichik hududda joylashgan qo'lda/yarim avtomatik avtomobil yuvish shohobchasi.",
    costMin: 15_000_000,
    costMax: 35_000_000,
    incomeMin: 6_000_000,
    incomeMax: 14_000_000,
    drayverKalitlari: ["xizmat"],
    tajriba: "Ikkalasi",
  },
  {
    id: "kir-yuvish",
    nomi: "Kir yuvish va dazmollash xizmati",
    soha: "Xizmat ko'rsatish",
    tavsif: "Aholi va kichik korxonalarga kir yuvish-dazmollash xizmati ko'rsatuvchi kombinat.",
    costMin: 10_000_000,
    costMax: 25_000_000,
    incomeMin: 5_000_000,
    incomeMax: 11_000_000,
    drayverKalitlari: ["xizmat"],
    tajriba: "Yangi boshlovchi",
  },
  {
    id: "texnika-tamirlash",
    nomi: "Uy-ro'zg'or texnikasini ta'mirlash ustaxonasi",
    soha: "Xizmat ko'rsatish",
    tavsif: "Muzlatgich, kir yuvish mashinasi va boshqa maishiy texnikani ta'mirlash xizmati.",
    costMin: 6_000_000,
    costMax: 15_000_000,
    incomeMin: 4_000_000,
    incomeMax: 9_000_000,
    drayverKalitlari: ["xizmat"],
    tajriba: "Tajribam bor",
  },
  {
    id: "fotostudiya",
    nomi: "Fotostudiya / tadbirlarni suratga olish xizmati",
    soha: "Xizmat ko'rsatish",
    tavsif: "To'y-marosim va boshqa tadbirlarni suratga/videoga olish xizmati.",
    costMin: 8_000_000,
    costMax: 20_000_000,
    incomeMin: 4_000_000,
    incomeMax: 10_000_000,
    drayverKalitlari: ["xizmat"],
    tajriba: "Ikkalasi",
  },

  // Savdo
  {
    id: "mini-market",
    nomi: "Oziq-ovqat mahsulotlari do'koni (mini-market)",
    soha: "Savdo",
    tavsif: "Kundalik ehtiyoj mahsulotlarini sotuvchi kichik mahalla do'koni.",
    costMin: 15_000_000,
    costMax: 40_000_000,
    incomeMin: 6_000_000,
    incomeMax: 15_000_000,
    drayverKalitlari: ["savdo", "oziq-ovqat"],
    tajriba: "Ikkalasi",
  },
  {
    id: "bolalar-kiyim",
    nomi: "Bolalar kiyim-kechak do'koni",
    soha: "Savdo",
    tavsif: "Bolalar kiyimi va aksessuarlari sotiladigan mahalla do'koni.",
    costMin: 10_000_000,
    costMax: 25_000_000,
    incomeMin: 4_000_000,
    incomeMax: 10_000_000,
    drayverKalitlari: ["savdo"],
    tajriba: "Yangi boshlovchi",
  },
  {
    id: "qurilish-materiallari",
    nomi: "Qurilish materiallari do'koni (mayda)",
    soha: "Savdo",
    tavsif: "Mahalliy qurilish-ta'mirlash ehtiyojlari uchun materiallar do'koni.",
    costMin: 20_000_000,
    costMax: 50_000_000,
    incomeMin: 7_000_000,
    incomeMax: 18_000_000,
    drayverKalitlari: ["savdo", "qurilish", "ishlab chiqarish"],
    tajriba: "Tajribam bor",
  },
  {
    id: "xojalik-tovarlari",
    nomi: "Xo'jalik va maishiy tovarlar do'koni",
    soha: "Savdo",
    tavsif: "Uy-ro'zg'or buyumlari va maishiy tovarlar sotiladigan do'kon.",
    costMin: 8_000_000,
    costMax: 20_000_000,
    incomeMin: 4_000_000,
    incomeMax: 9_000_000,
    drayverKalitlari: ["savdo"],
    tajriba: "Yangi boshlovchi",
  },
  {
    id: "onlayn-savdo",
    nomi: "Onlayn savdo (kiyim/aksessuar, marketplace orqali)",
    soha: "Savdo",
    tavsif: "Ijtimoiy tarmoq va marketplace orqali kiyim yoki aksessuar sotish.",
    costMin: 3_000_000,
    costMax: 8_000_000,
    incomeMin: 2_500_000,
    incomeMax: 6_000_000,
    drayverKalitlari: ["savdo"],
    tajriba: "Yangi boshlovchi",
  },

  // Oziq-ovqat
  {
    id: "nonvoyxona",
    nomi: "Non yopish sexi (mini nonvoyxona)",
    soha: "Oziq-ovqat",
    tavsif: "Kunlik non va non mahsulotlari ishlab chiqaradigan kichik sex.",
    costMin: 10_000_000,
    costMax: 25_000_000,
    incomeMin: 5_000_000,
    incomeMax: 12_000_000,
    drayverKalitlari: ["oziq-ovqat"],
    tajriba: "Tajribam bor",
  },
  {
    id: "milliy-taomlar",
    nomi: "Milliy taomlar tayyorlash va yetkazib berish",
    soha: "Oziq-ovqat",
    tavsif: "Buyurtma asosida uyga/office'ga milliy taom yetkazib berish xizmati.",
    costMin: 6_000_000,
    costMax: 15_000_000,
    incomeMin: 4_000_000,
    incomeMax: 9_000_000,
    drayverKalitlari: ["oziq-ovqat", "xizmat"],
    tajriba: "Ikkalasi",
  },
  {
    id: "konditer",
    nomi: "Konditer sexi (tort va shirinliklar)",
    soha: "Oziq-ovqat",
    tavsif: "Tort, pirojniy va boshqa shirinliklar tayyorlaydigan kichik sex.",
    costMin: 8_000_000,
    costMax: 18_000_000,
    incomeMin: 4_000_000,
    incomeMax: 9_000_000,
    drayverKalitlari: ["oziq-ovqat"],
    tajriba: "Tajribam bor",
  },
  {
    id: "fastfud",
    nomi: "Fastfud / shashlik shohobchasi",
    soha: "Oziq-ovqat",
    tavsif: "Ko'cha bo'yida yoki savdo markazida kichik tez ovqatlanish shohobchasi.",
    costMin: 12_000_000,
    costMax: 28_000_000,
    incomeMin: 6_000_000,
    incomeMax: 13_000_000,
    drayverKalitlari: ["oziq-ovqat"],
    tajriba: "Ikkalasi",
  },

  // Ishlab chiqarish
  {
    id: "tikuvchilik-sex",
    nomi: "Tikuvchilik sexi (kichik, 3-5 mashinali)",
    soha: "Ishlab chiqarish",
    tavsif: "Kiyim-kechak seriyali ishlab chiqarish uchun kichik tikuvchilik sexi.",
    costMin: 20_000_000,
    costMax: 45_000_000,
    incomeMin: 8_000_000,
    incomeMax: 18_000_000,
    drayverKalitlari: ["ishlab chiqarish"],
    tajriba: "Tajribam bor",
  },
  {
    id: "mebel-ustaxona",
    nomi: "Mebel yasash ustaxonasi (kichik)",
    soha: "Ishlab chiqarish",
    tavsif: "Buyurtma asosida uy va office mebeli yasaydigan kichik ustaxona.",
    costMin: 25_000_000,
    costMax: 55_000_000,
    incomeMin: 9_000_000,
    incomeMax: 20_000_000,
    drayverKalitlari: ["ishlab chiqarish"],
    tajriba: "Tajribam bor",
  },
  {
    id: "metall-payvand",
    nomi: "Metall va payvandlash ustaxonasi",
    soha: "Ishlab chiqarish",
    tavsif: "Metall konstruksiya, darvoza-panjara va payvandlash xizmatlari ustaxonasi.",
    costMin: 18_000_000,
    costMax: 40_000_000,
    incomeMin: 8_000_000,
    incomeMax: 17_000_000,
    drayverKalitlari: ["ishlab chiqarish"],
    tajriba: "Tajribam bor",
  },
  {
    id: "qadoqlash-sex",
    nomi: "Qadoqlash va etiketka xizmati (kichik korxonalarga)",
    soha: "Ishlab chiqarish",
    tavsif: "Mahalliy ishlab chiqaruvchilarga qadoqlash va markalash xizmati ko'rsatuvchi sex.",
    costMin: 15_000_000,
    costMax: 35_000_000,
    incomeMin: 6_000_000,
    incomeMax: 14_000_000,
    drayverKalitlari: ["ishlab chiqarish", "savdo-sanoat"],
    tajriba: "Ikkalasi",
  },

  // Qishloq xo'jaligi
  {
    id: "issiqxona",
    nomi: "Issiqxonada sabzavot yetishtirish",
    soha: "Qishloq xo'jaligi",
    tavsif: "Yil davomida sabzavot yetishtiradigan kichik issiqxona xo'jaligi.",
    costMin: 15_000_000,
    costMax: 40_000_000,
    incomeMin: 6_000_000,
    incomeMax: 16_000_000,
    drayverKalitlari: ["qishloq", "chorvachilik"],
    tajriba: "Ikkalasi",
  },
  {
    id: "parrandachilik",
    nomi: "Parrandachilik fermasi (tovuq, tuxum)",
    soha: "Qishloq xo'jaligi",
    tavsif: "Tuxum va go'sht uchun kichik parrandachilik fermasi.",
    costMin: 10_000_000,
    costMax: 30_000_000,
    incomeMin: 5_000_000,
    incomeMax: 14_000_000,
    drayverKalitlari: ["qishloq", "chorvachilik"],
    tajriba: "Tajribam bor",
  },
  {
    id: "asalarichilik",
    nomi: "Asalarichilik",
    soha: "Qishloq xo'jaligi",
    tavsif: "Asal va asalarichilik mahsulotlari ishlab chiqarish.",
    costMin: 8_000_000,
    costMax: 20_000_000,
    incomeMin: 3_000_000,
    incomeMax: 9_000_000,
    drayverKalitlari: ["qishloq"],
    tajriba: "Tajribam bor",
  },

  // Qurilish
  {
    id: "boyoqchi-brigada",
    nomi: "Ta'mirlash-bo'yoqchilik brigadasi (pudratchi xizmati)",
    soha: "Qurilish",
    tavsif: "Uy va ofis ta'mirlash ishlarini bajaruvchi kichik brigada xizmati.",
    costMin: 5_000_000,
    costMax: 12_000_000,
    incomeMin: 5_000_000,
    incomeMax: 12_000_000,
    drayverKalitlari: ["qurilish", "xizmat"],
    tajriba: "Tajribam bor",
  },
  {
    id: "santexnika-elektrika",
    nomi: "Santexnika va elektrika o'rnatish xizmati",
    soha: "Qurilish",
    tavsif: "Uy va ofislarda santexnika/elektrika montaj va ta'mirlash xizmati.",
    costMin: 6_000_000,
    costMax: 14_000_000,
    incomeMin: 5_000_000,
    incomeMax: 11_000_000,
    drayverKalitlari: ["qurilish", "xizmat"],
    tajriba: "Tajribam bor",
  },

  // IT va raqamli xizmatlar
  {
    id: "smm-sayt",
    nomi: "Kichik biznes uchun sayt/ijtimoiy tarmoq boshqaruvi xizmati",
    soha: "IT va raqamli xizmatlar",
    tavsif: "Mahalliy tadbirkorlarga sayt yaratish va ijtimoiy tarmoq yuritish xizmati.",
    costMin: 3_000_000,
    costMax: 8_000_000,
    incomeMin: 3_000_000,
    incomeMax: 8_000_000,
    drayverKalitlari: ["xizmat"],
    tajriba: "Tajribam bor",
  },
  {
    id: "telefon-tamirlash",
    nomi: "Kompyuter va telefon ta'mirlash xizmati",
    soha: "IT va raqamli xizmatlar",
    tavsif: "Kompyuter, noutbuk va telefonlarni diagnostika qilish va ta'mirlash ustaxonasi.",
    costMin: 5_000_000,
    costMax: 12_000_000,
    incomeMin: 4_000_000,
    incomeMax: 9_000_000,
    drayverKalitlari: ["xizmat"],
    tajriba: "Tajribam bor",
  },

  // Ta'lim
  {
    id: "bolalar-bogchasi",
    nomi: "Xususiy bolalar bog'chasi (mini)",
    soha: "Ta'lim",
    tavsif: "Kichik guruh (10-20 bola) uchun mahalla darajasidagi xususiy bolalar bog'chasi.",
    costMin: 25_000_000,
    costMax: 55_000_000,
    incomeMin: 8_000_000,
    incomeMax: 18_000_000,
    drayverKalitlari: ["xizmat"],
    tajriba: "Ikkalasi",
  },
  {
    id: "otqirtish-markazi",
    nomi: "O'quv markazi (til/fan kurslari)",
    soha: "Ta'lim",
    tavsif: "Bolalar va kattalar uchun chet tili yoki fan yo'nalishidagi kichik o'quv markazi.",
    costMin: 8_000_000,
    costMax: 20_000_000,
    incomeMin: 5_000_000,
    incomeMax: 12_000_000,
    drayverKalitlari: ["xizmat"],
    tajriba: "Tajribam bor",
  },

  // Turizm va mehmondo'stlik
  {
    id: "gostinitsa",
    nomi: "Mehmon uyi (kichik gostinitsa)",
    soha: "Turizm va mehmondo'stlik",
    tavsif: "PQ-49 turizm imtiyozlariga mos, kichik hajmdagi mehmon uyi xizmati.",
    costMin: 30_000_000,
    costMax: 80_000_000,
    incomeMin: 8_000_000,
    incomeMax: 20_000_000,
    drayverKalitlari: ["turizm", "xizmat"],
    tajriba: "Tajribam bor",
  },
];
