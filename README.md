# Asaka Mahalla AI

Asakabank Yunusobod tumani BXM uchun platforma — fuqarolar kredit tanlaydi, ariza beradi,
mahalla bankiri bilan bog'lanadi va AI yordamida o'z mahallasiga mos biznes g'oyasi topadi.

Dizayn tizimi va sahifa strukturasi `asaka-mahalla-ai-prototype_1.html` prototipidan olingan;
bu loyiha uni haqiqiy backend, baza va autentifikatsiya bilan production-ready holatga keltiradi.

## Texnik stack

- **Frontend/Backend:** Next.js 16 (App Router, Server Actions), TypeScript
- **Baza:** SQLite dev bosqichida (Prisma ORM) — `prisma/schema.prisma`dagi `provider`ni
  `postgresql`ga o'zgartirib, `DATABASE_URL`ni Postgres ulanish satriga almashtirish orqali
  productionga o'tkaziladi
- **Autentifikatsiya:** bcrypt (parol xeshlash) + imzolangan JWT sessiya cookie (`jose`)
- **AI:** Anthropic Claude API (`@anthropic-ai/sdk`), server-side chaqiriladi

## Ishga tushirish

```bash
npm install
npx prisma migrate dev   # baza sxemasini yaratadi
npx prisma db seed       # 7 ta real mahalla, admin va bankirlarni yuklaydi
npm run dev
```

`.env` faylida:

- `DATABASE_URL` — SQLite fayl yo'li (standart holatda tayyor)
- `ANTHROPIC_API_KEY` — AI biznes-reja tavsiyachisi ishlashi uchun shart
  ([console.anthropic.com](https://console.anthropic.com/settings/keys))
- `AUTH_SECRET` — sessiya cookie imzolash uchun tasodifiy maxfiy kalit (productionda albatta
  o'zgartiring)

## Demo hisoblar

| Rol | Login | Parol |
|---|---|---|
| Admin | `admin` | `admin2026` |
| Bankir (Otchopar 1, Otchopar 2) | `jamshidkarimov` | `123` |
| Bankir (Yurtobod, Yangiariq) | `sardorgaffarov` | `123` |
| Bankir (Oqtepa, Posira, Muruvvat) | `tolibjonburxonov` | `123` |

Fuqaro sifatida kirish uchun parol kerak emas — faqat ism va telefon raqami.
