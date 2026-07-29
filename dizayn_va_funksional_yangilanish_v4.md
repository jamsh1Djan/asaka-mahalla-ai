# "Asaka Mahalla AI" — Dizayn va Funksionallik Yangilanishi (v4)
*Yuborilgan eskizlar (hoshiya, tugma, xarita, logotip) va matn izohlari asosida tuzildi*

---

## 1. Umumiy dizayn yo'nalishi

Joriy dizayn (krem fon + oddiy qizil tugmalar) — generik va "zerikarli" ko'rinadi. Siz yuborgan namunalar aniq yo'nalish beradi: **milliy/an'anaviy o'zbek** uslubi — geometrik islomiy-me'moriy naqsh (hoshiya), yarim oy motividagi logotip, va teksturali, "engil porlaydigan" tugmalar.

### Token tizimi
- **Fon:** issiq oq/krem (`#FBF8F2`) — asosiy kontent maydonlari uchun neytral qoladi
- **Hoshiya rangi:** oltin/tillarang (`#C9A227`) + to'q feruza/ko'k (`#1B4B5A`) — geometrik naqsh ikki rangda
- **Asosiy aksent:** to'yingan qizil (`#B0202E`, Asaka brendiga mos, lekin chuqurroq)
- **Tugma foni:** yengil gradient/tekstura (yassi rang emas) — hoshiya bilan bir xil naqsh oilasidan olingan mayda pattern, ustida yorug'lik effekti (hover'da porlash)

### Signature element
Sayt yuqori qismidagi va bo'lim ajratuvchi chiziqlardagi **hoshiya naqshi** — bu saytning "imzosi" bo'ladi: har bir asosiy blok (hero, statistika, xarita, footer) shu naqsh bilan ajratiladi, generik `border-radius` o'rniga.

---

## 2. Logotip va kirish animatsiyasi

**Talab:** sayt ochilganda katta logotip 1 soniya ko'rinadi, keyin yo'qoladi (splash screen).

### Splash screen ketma-ketligi (jami ~3 soniya)
1. **0.0–1.0s:** ekran markazida katta logotip statik holda turadi
2. **1.0–2.5s:** effekt boshlanadi — pastki qismda nur chizig'i aylanadi, burchaklar (hoshiya elementlari) sekin harakatlanadi, markazda kichik yorug'lik porlaydi
3. **2.5–3.0s:** logotip (yarim oy + "Asaka Mahalla AI" matni, ikkalasidan biri asosiy holatda) markazdan chiqib, o'z joyiga — yuqori chap burchakka — kichrayib joylashadi
4. **3.0s+:** splash screen yo'qoladi, asosiy sahifa ko'rinadi

### Texnik eslatma (Claude Code uchun)
- CSS `@keyframes` yoki Framer Motion/GSAP bilan amalga oshirish mumkin
- `prefers-reduced-motion` uchun animatsiyasiz variant ham bo'lishi shart (kirish talab qilinadi)
- Splash screen faqat **birinchi tashrifda** (yoki har safar — buni tanlang) ko'rsatilishi mumkin; agar har safar bo'lsa, brauzer saqlash (localStorage/sessionStorage) o'rniga server session yoki oddiy har-safar-ko'rsatish yondashuvi tavsiya etiladi

### Yuqori chap burchakdagi belgi
Joriy "AM Asaka Mahalla AI" matn-belgisi o'rniga — yuborilgan logotip namunalaridan biri (yarim oy aylanma dizayni yoki matnli versiya) qo'yiladi. Kichraytirilgan holatda ham aylana harakati (juda sekin, ambient) davom etishi mumkin — lekin bu ixtiyoriy, asosiysi emas.

---

## 3. Tugmalar (Buttons) yangilanishi

Joriy tugmalar tekis rangli va "zerikarli". Yangi uslub:
- Fon: yengil tekstura/gradient (hoshiya naqsh oilasidan olingan mayda pattern, past kontrastda)
- Hover holati: yorug'lik porlashi (glow) effekti — chekka atrofida yumshoq nur
- Chekka: nozik oltin/tillarang chiziq (hoshiya rangiga mos)
- Bu uslub barcha asosiy CTA tugmalarga (AI yordamchi, Oldindan tasdiqni tekshirish, va h.k.) qo'llanadi

---

## 4. Xarita (Mahallalar xaritasi) yangilanishi

Joriy xarita — oddiy, generik ko'rinishda. Yuborilgan namunaga asoslanib:
- Xarita **stilize/illyustrativ** ko'rinishga o'tkaziladi (real GPS xarita emas, balki mahallalarni hudud sifatida ko'rsatuvchi grafik sxema — masalan har bir mahalla alohida "blok" sifatida, rang kodlash bilan: faol/nofaol, ishsizlik darajasi va h.k.)
- Bosilganda mahalla haqida batafsil panel ochiladi (hozirgidek)
- **Muhim:** funksionallik o'zgarmaydi, faqat vizual taqdimot boyitiladi

---

## 5. Funksional xatolar va tuzatishlar (Bug fixes)

Bu qism dizayndan mustaqil — lekin siz aytganidek, **ular ham hal qilinmasa, bo'limlar ishlamay qoladi**, shuning uchun alohida ro'yxatga olindi:

| № | Muammo | Kerakli tuzatish |
|---|---|---|
| 1 | "To'lov qulayligini tekshirish" bo'limida sonli maydonlarni tahrirlashda, bitta o'zgartirishdan keyin yana bosish talab qilinadi | Input maydonini to'g'ri controlled component qilish — har bir belgi kiritilganda darhol qayta render bo'lishi, ikki marta bosish shart bo'lmasligi kerak |
| 2 | Bankir ma'lumot (masalan bo'sh ish o'rni) o'zgartirsa, fuqarolar tomonida ko'rinmayapti | Bankir → fuqaro o'rtasida real ma'lumotlar ulanishi (bitta umumiy ma'lumotlar bazasidan o'qish, ikkalasi ham sync bo'lishi) |
| 3 | Bankir bo'sh ish o'rnini kiritganda, fuqarolar qismida umuman ko'rinmaydi | Yuqoridagi bilan bir xil ildiz sabab — backend ulanishini tekshirish |
| 4 | "Mahalladagi o'zgarishlar" nomlanishi noaniq | Nomini **"Mahalladagi bo'sh ish o'rinlari"** ga o'zgartirish — bu foydaliroq va aniqroq |
| 5 | MCHJ va YATT haqida juda batafsil ma'lumot ko'rsatilyapti | Faqat asosiy sonlarni ko'rsatish, ortiqcha tafsilotlarni olib tashlash |
| 6 | Ariza berish oqimi 5 bosqichli, bu ortiqcha murakkab | Soddalashtirish: fuqaroga faqat — *"Arizangiz qabul qilindi. Mahalla bankiri ko'rib chiqadi va siz bilan qo'ng'iroq yoki SMS orqali bog'lanadi"* — degan bitta xabar yetarli |
| 7 | Fuqaro ariza bersa, bankirga umuman yetib bormayapti | Bu **eng muhim** bug — ariza yuborilganda backend orqali bankir kabinetiga (tegishli mahalla bo'yicha) real vaqtda yozilishi shart. Buni birinchi navbatda tekshirish kerak |
| 8 | Mahalla rasmi (mahalla nomi oldidagi surat) admin/bankir tomonidan o'zgartirilmayapti | Mahalla profiliga rasm yuklash/almashtirish funksiyasi qo'shish (fayl yuklash + saqlash) |
| 9 | Super admin bankirlarga berilgan login/parolni keyinchalik o'zgartira olishi kerak | Bu oldingi Super Admin specida ko'rsatilgan — shu funksiya to'liq ishlashi tasdiqlanishi kerak |

---

## 6. Ustuvorlik tartibi (qaysi tartibda qilish tavsiya etiladi)

1. **№7 bug** (ariza bankirga yetib bormasligi) — bu funksional jihatdan eng kritik, foydalanuvchi ishonchiga bevosita ta'sir qiladi
2. **№2, №3 bug** (bankir-fuqaro ma'lumot sinxronizatsiyasi) — ikkinchi darajali kritik
3. **№1 bug** (raqam kiritish) — tez tuzatiladigan, lekin foydalanuvchi tajribasiga to'g'ridan-to'g'ri ta'sir qiladi
4. Dizayn yangilanishlari (hoshiya, tugmalar, logotip, xarita) — vizual, lekin funksionallikka bog'liq emas, shuning uchun parallel yoki keyinroq qilinishi mumkin
5. №4, №5, №6, №8, №9 — o'rta ustuvorlik, tezkor amalga oshiriladigan

---

## 7. Claude Code'ga topshirish uchun eslatma

Ushbu hujjatni loyihangizdagi Claude Code'ga (yoki boshqa dasturchiga) to'g'ridan-to'g'ri bering. Eskizlar (hoshiya, tugma, xarita, logotip rasmlari) alohida fayllar sifatida saqlanganini va ularga ishora qilinganini eslatib qo'ying — Claude Code o'zi loyihadagi shu rasmlarni ko'rib, ularga mos CSS/SVG yaratishi kerak.
