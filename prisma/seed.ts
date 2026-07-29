import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { MAP_LAYOUT } from "../src/lib/data";

const prisma = new PrismaClient();

const MAHALLAS = [
  {
    id: "otchopar1",
    nomi: "Otchopar 1",
    sector: "1-sektor",
    tashkil: 1934,
    aholi: 8626,
    erkak: 4160,
    ayol: 4464,
    xonadon: 1840,
    oila: 4011,
    tadbirkorlik: 154,
    yatt: 36,
    mchj: 42,
    faoliyatTurlari: "Sartaroshxona, Kir yuvish xizmati, Avtoservis, Fotostudiya, Ta'mirlash ustaxonasi",
    vakansiya: 8,
    drayver: "Xizmat ko'rsatish",
    agent: "Usmonova Malika Islomovna",
    color: "#C8102E",
  },
  {
    id: "otchopar2",
    nomi: "Otchopar 2",
    sector: "4-sektor",
    tashkil: 1966,
    aholi: 6420,
    erkak: 3311,
    ayol: 3109,
    xonadon: 2024,
    oila: 2089,
    tadbirkorlik: 26,
    yatt: 12,
    mchj: 11,
    faoliyatTurlari: "Tikuvchilik sexi, Metall-payvandlash ustaxonasi, Qadoqlash sexi, Ulgurji savdo, Ta'mirlash xizmati",
    vakansiya: 14,
    drayver: "Ishlab chiqarish, xizmat ko'rsatish, savdo-sanoat",
    agent: "Ortiqov Ziyoviddin Faxriddin o'g'li",
    color: "#0B2545",
  },
  {
    id: "yurtobod",
    nomi: "Yurtobod",
    sector: "2-sektor",
    tashkil: 2015,
    aholi: 5314,
    erkak: 2544,
    ayol: 2770,
    xonadon: 1492,
    oila: 1874,
    tadbirkorlik: 16,
    yatt: 15,
    mchj: 5,
    faoliyatTurlari: "Oziq-ovqat do'koni, Kiyim-kechak do'koni, Kir yuvish xizmati, Sartaroshxona",
    vakansiya: 14,
    drayver: "Aholiga savdo va maishiy xizmat ko'rsatish",
    agent: "Xabibullayeva Yunona Lovar qizi",
    color: "#C69C4E",
  },
  {
    id: "yangiariq",
    nomi: "Yangiariq",
    sector: "3-sektor",
    tashkil: 1950,
    aholi: 4560,
    erkak: 2260,
    ayol: 2300,
    xonadon: 749,
    oila: 795,
    tadbirkorlik: 5,
    yatt: 2,
    mchj: 2,
    faoliyatTurlari: "Non yopish sexi, Milliy taomlar tayyorlash, Oziq-ovqat do'koni, Konditer sexi",
    vakansiya: 0,
    drayver: "Oziq-ovqat va xizmat ko'rsatish",
    agent: "Rustamova Mehrigiyo Vali qizi",
    color: "#2b7a43",
  },
  {
    id: "oqtepa",
    nomi: "Oqtepa",
    sector: "2-sektor",
    tashkil: 1930,
    aholi: 7751,
    erkak: 3950,
    ayol: 3801,
    xonadon: 1557,
    oila: 3552,
    tadbirkorlik: 64,
    yatt: 82,
    mchj: 19,
    faoliyatTurlari: "Mini-market, Xo'jalik tovarlari do'koni, Poyabzal ta'mirlash, Sartaroshxona",
    vakansiya: 8,
    drayver: "Aholiga savdo va maishiy xizmat ko'rsatish",
    agent: "Karimova Shahzoda Ahrorovna",
    color: "#1a3a68",
  },
  {
    id: "posira",
    nomi: "Posira",
    sector: "4-sektor",
    tashkil: 1992,
    aholi: 7553,
    erkak: 3800,
    ayol: 3753,
    xonadon: 2360,
    oila: 2777,
    tadbirkorlik: 285,
    yatt: 97,
    mchj: 68,
    faoliyatTurlari: "Bozor rastalari, Kiyim-kechak do'koni, Avtomobil yuvish, Fastfud shoxobchasi",
    vakansiya: 17,
    drayver: "Aholiga savdo va maishiy xizmat ko'rsatish",
    agent: "—",
    color: "#8a6a1f",
  },
  {
    id: "muruvvat",
    nomi: "Muruvvat",
    sector: "2-sektor",
    tashkil: 1975,
    aholi: 5138,
    erkak: 2475,
    ayol: 2663,
    xonadon: 1320,
    oila: 1472,
    tadbirkorlik: 38,
    yatt: 6,
    mchj: 10,
    faoliyatTurlari: "Oziq-ovqat do'koni, Kir yuvish xizmati, Uy texnikasini ta'mirlash",
    vakansiya: 4,
    drayver: "Aholiga savdo va maishiy xizmat ko'rsatish",
    agent: "Zaitova Kamola Xamidullayevna",
    color: "#9C0C24",
  },
];

async function main() {
  for (const m of MAHALLAS) {
    const data = { ...m, mapPoints: MAP_LAYOUT[m.id], isSeed: true, tuman: "Yunusobod" };
    await prisma.mahalla.upsert({
      where: { id: m.id },
      update: data,
      create: data,
    });
  }

  const adminHash = await bcrypt.hash("admin2026", 10);
  await prisma.banker.upsert({
    where: { login: "admin" },
    update: {},
    create: {
      login: "admin",
      passwordHash: adminHash,
      role: "ADMIN",
      ism: "Bosh administrator",
    },
  });

  const jamshidHash = await bcrypt.hash("123", 10);
  await prisma.banker.upsert({
    where: { login: "jamshidkarimov" },
    update: {},
    create: {
      login: "jamshidkarimov",
      passwordHash: jamshidHash,
      role: "BANKER",
      ism: "Karimov Jamshid",
      telefon: "+998 90 123 45 67",
      telegram: "https://t.me/Jamsh1d_Kar1mov",
      ishVaqti: "09:00 – 18:00",
      mahallalar: {
        create: [{ mahallaId: "otchopar1" }, { mahallaId: "otchopar2" }],
      },
    },
  });

  const otherBankers = [
    {
      login: "sardorgaffarov",
      ism: "G'affarov Sardor O'ktam o'g'li",
      mahallalar: ["yurtobod", "yangiariq"],
    },
    {
      login: "tolibjonburxonov",
      ism: "Burxonov Tolibjon Musurmon o'g'li",
      mahallalar: ["oqtepa", "posira", "muruvvat"],
    },
  ];
  for (const b of otherBankers) {
    const passwordHash = await bcrypt.hash("123", 10);
    await prisma.banker.upsert({
      where: { login: b.login },
      update: {},
      create: {
        login: b.login,
        passwordHash,
        role: "BANKER",
        ism: b.ism,
        ishVaqti: "09:00 – 18:00",
        mahallalar: { create: b.mahallalar.map((mahallaId) => ({ mahallaId })) },
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
