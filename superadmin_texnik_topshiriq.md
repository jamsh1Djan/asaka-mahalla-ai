# "Asaka Mahalla AI" platformasi — Super Admin roli uchun texnik topshiriq (TT)

## 0. Maqsad
Platformada uch pog'onali rol tizimini joriy qilish: **Fuqaro → Mahalla bankiri → Super Admin**. Super Admin butun platforma ustidan to'liq nazoratga ega bo'lishi, mahallalar, bankirlar, foydalanuvchilar, arizalar va login-parollar bazasini boshqara olishi kerak.

---

## 1. Rollar ierarxiyasi va huquqlar matritsasi

| Funksiya | Fuqaro | Bankir | Super Admin |
|---|:---:|:---:|:---:|
| Bosh sahifa, Kreditlar, Kalkulyator, Oldindan tasdiq, Mahallam | ✅ | ✅ | ✅ |
| Bankir kabineti (ko'rsatkichlarni tahrirlash) | ❌ | ✅ (faqat o'z mahallasi) | ✅ (barcha mahallalar) |
| E'lonlar qo'shish/tahrirlash | ❌ | ✅ (faqat o'z mahallasi) | ✅ (barcha mahallalar) |
| Yangi mahalla qo'shish | ❌ | ❌ | ✅ |
| Mahalla ma'lumotlarini o'zgartirish (istalgan mahalla) | ❌ | ❌ | ✅ |
| Arizalarni ko'rish/boshqarish | ❌ | ✅ (o'z mahallasi) | ✅ (barchasi) |
| Kirish/chiqish tarixini (login/logout log) ko'rish | ❌ | ❌ | ✅ |
| Bankirlarga yangi login yaratish | ❌ | ❌ | ✅ |
| Bankirni mahallaga biriktirish/uzish | ❌ | ❌ | ✅ |
| Login-parollar bazasini ko'rish/boshqarish | ❌ | ❌ | ✅ |
| Parollarni reset qilish / bloklash | ❌ | ❌ | ✅ |
| Tizim sozlamalari (AI tavsiya, umumiy konfiguratsiya) | ❌ | ❌ | ✅ |
| Audit log (kim, nima, qachon o'zgartirdi) | ❌ | ❌ | ✅ |

**Muhim qoida:** menyu bo'limlari **backend'dagi `role` maydoniga** qarab dinamik chiqishi kerak. Faqat frontendda yashirish yetarli emas — har bir API endpoint backend darajasida ham rolga qarab tekshirilishi shart (masalan, bankir to'g'ridan-to'g'ri API'ga so'rov yuborib boshqa mahallani o'zgartira olmasligi kerak).

---

## 2. Mahalla boshqaruvi moduli (Super Admin uchun)

### 2.1 Yangi mahalla qo'shish
Forma maydonlari:
- Mahalla nomi
- Tuman/viloyat
- Manzil
- Aholi soni (boshlang'ich)
- Mas'ul bankir (dropdown — mavjud bankirlar ro'yxatidan, yoki keyinroq biriktiriladi)
- Status (Faol / Faol emas)

### 2.2 Mavjud mahalla ma'lumotlarini tahrirlash
Super admin istalgan mahallaning quyidagi ma'lumotlarini o'zgartira olishi kerak:
- Bo'sh ish o'rinlari
- Jami tadbirkorlik subyektlari
- YATT soni
- MChJ soni
- Aholi soni
- Ixtisoslashuv (drayver)
- E'lonlar (qo'shish/o'chirish/tahrirlash)
- Mahallaga biriktirilgan bankir(lar)

### 2.3 Mahallalar ro'yxati (jadval ko'rinishi)
Ustunlar: Mahalla nomi | Mas'ul bankir | Aholi soni | Oxirgi yangilangan sana | Status | Amallar (Tahrirlash/O'chirish)

---

## 3. Arizalar monitoring moduli

Super admin barcha mahallalardan kelgan arizalarni bitta joyda ko'ra olishi kerak:

| Maydon | Tavsif |
|---|---|
| Ariza ID | Noyob raqam |
| Fuqaro | Ism-familiya |
| Mahalla | Qaysi mahalladan |
| Ariza turi | Kredit / Oldindan tasdiq / boshqa |
| Sana | Topshirilgan vaqt |
| Status | Ko'rib chiqilmoqda / Tasdiqlangan / Rad etilgan |
| Mas'ul bankir | Kim ko'rib chiqmoqda |

Filtrlash imkoniyati: mahalla bo'yicha, status bo'yicha, sana oralig'i bo'yicha.

---

## 4. Kirish/chiqish tarixi (Session/Login Audit Log)

Har bir foydalanuvchi (bankir yoki super admin) tizimga kirganda va chiqqanda quyidagi ma'lumotlar avtomatik yozilishi kerak:

| Maydon | Tavsif |
|---|---|
| Foydalanuvchi | Login/ism |
| Rol | Bankir / Super Admin |
| Mahalla | Qaysi mahallaga biriktirilgan |
| Kirgan vaqt | Sana + soat |
| Chiqqan vaqt | Sana + soat (yoki "hali faol") |
| IP manzil | Xavfsizlik uchun |
| Qurilma/brauzer | User-agent |

Super admin panelida bu jadval **real vaqtda** ko'rinishi va sana bo'yicha filtrlash mumkin bo'lishi kerak.

---

## 5. Bankirlarni boshqarish moduli

### 5.1 Yangi bankir hisobini yaratish
Forma:
- To'liq ism
- Login (username)
- Boshlang'ich parol (tizim avtomatik generatsiya qiladi yoki super admin kiritadi)
- Telefon raqam
- Biriktirilgan mahalla (bitta yoki bir nechta mahalla tanlash mumkin)
- Status (Faol / Bloklangan)

### 5.2 Bankirni mahallaga biriktirish
- Bir bankir bir nechta mahallaga mas'ul bo'la olishi mumkin (agar biznes talab shunday bo'lsa)
- Super admin istalgan vaqtda bankirni bir mahalladan olib, boshqasiga o'tkaza olishi kerak
- Biriktirish tarixi saqlanishi kerak (qachon qaysi bankir qaysi mahallaga tayinlangan)

### 5.3 Bankirlar ro'yxati
Ustunlar: Ism | Login | Biriktirilgan mahalla(lar) | Oxirgi kirgan vaqt | Status | Amallar (Tahrirlash/Bloklash/Parolni reset qilish)

---

## 6. Login-parollar bazasi va nazorati (Super Admin uchun markaziy panel)

Bu — eng nozik bo'lim, shuning uchun xavfsizlik talablari alohida ko'rsatiladi (5-bo'limga qarang).

Super admin quyidagilarni bajara olishi kerak:
- Barcha foydalanuvchilar (bankirlar) ro'yxatini ko'rish
- Har bir foydalanuvchi uchun parolni **reset qilish** (yangi vaqtinchalik parol generatsiya qilinadi, real parolni hech kim — hatto super admin ham — ochiq holda ko'rmaydi)
- Foydalanuvchini **bloklash/blokdan chiqarish**
- Login urinishlari tarixini ko'rish (muvaffaqiyatli/muvaffaqiyatsiz)
- Ikki bosqichli tasdiqlash (2FA) ni majburiy qilish imkoniyati

### ⚠️ Xavfsizlik bo'yicha muhim eslatma
Siz yuborgan `Superadmin / jamsh1Djan` — bu boshlang'ich kirish ma'lumoti sifatida ishlatilishi mumkin, lekin quyidagi qoidalarga rioya qilish **shart**:
1. Parol bazada hech qachon ochiq (plaintext) holda saqlanmasligi kerak — faqat **bcrypt/argon2** kabi algoritm bilan hash qilinib saqlanadi.
2. Birinchi marta kirgandan so'ng tizim super adminni **parolni majburiy o'zgartirishga** yo'naltirishi kerak.
3. Super admin akkauntiga **2FA (SMS yoki authenticator app)** albatta ulanishi tavsiya etiladi, chunki bu akkaunt butun tizimni boshqaradi.
4. Parollar hech qachon email, chat yoki log fayllarda ochiq matn holida yuborilmasligi/saqlanmasligi kerak.

---

## 7. Super Adminning umumiy huquqlari (yakuniy ro'yxat)

- ✅ Yangi mahalla qo'shish, tahrirlash, o'chirish
- ✅ Istalgan mahalla ma'lumotlarini (ko'rsatkichlar, e'lonlar) o'zgartirish
- ✅ Barcha arizalarni ko'rish va boshqarish
- ✅ Kirish/chiqish (login/logout) tarixini to'liq ko'rish
- ✅ Yangi bankir login/parol yaratish
- ✅ Bankirni mahallaga biriktirish yoki undan uzish
- ✅ Login-parollar bazasini boshqarish (reset, bloklash, 2FA majburlash)
- ✅ Platformaning istalgan bo'limini (menyu, kontent, AI tavsiya parametrlari) o'zgartirish
- ✅ Audit log orqali barcha o'zgarishlarni kuzatish (kim, qachon, nimani o'zgartirdi)
- ✅ Yangi super admin yoki boshqa maxsus rollar yarata olish (agar kelajakda kerak bo'lsa)

---

## 8. Taklif etilayotgan ma'lumotlar bazasi tuzilmasi (soddalashtirilgan)

```
users
- id, full_name, login, password_hash, role (citizen/banker/superadmin),
  phone, status (active/blocked), created_at, last_login_at

mahallalar
- id, name, region, address, population, status, created_by, updated_at

banker_mahalla (many-to-many)
- id, banker_id, mahalla_id, assigned_at, assigned_by, unassigned_at

listings (e'lonlar)
- id, mahalla_id, type (rent/job/other), title, description,
  price_or_salary, address, contact_phone, expires_at, created_by, created_at

applications (arizalar)
- id, citizen_id, mahalla_id, type, status, submitted_at, reviewed_by

login_logs
- id, user_id, login_at, logout_at, ip_address, user_agent

audit_logs
- id, user_id, action, target_table, target_id, old_value, new_value, created_at
```

---

## 9. UI/UX — Super Admin uchun yangi menyu bo'limlari

Super admin kirganda yuqori navigatsiyaga qo'shimcha bo'limlar chiqishi kerak:

```
Bosh sahifa | Mahallalar | Bankirlar | Arizalar | Kirish tarixi | Foydalanuvchilar (login/parol) | Sozlamalar
```

Har bir bo'lim alohida sahifa/panel bo'lib, yuqorida tavsiflangan funksiyalarni o'zida jamlaydi.

---

## 10. Amalga oshirish bosqichlari (tavsiya)

1. **Backend:** `role` maydonini `users` jadvaliga qo'shish, middleware orqali har bir endpointni rol bo'yicha himoyalash
2. **Auth:** parolni hash qilish, JWT/session boshqaruvi, login_logs yozuvini avtomatlashtirish
3. **Mahalla CRUD:** super admin uchun to'liq CRUD API va UI
4. **Bankir boshqaruvi:** yangi login yaratish + mahallaga biriktirish logikasi
5. **Arizalar va e'lonlar:** mavjud modullarni rol asosida kengaytirish
6. **Audit log:** har bir yozish/o'zgartirish amalini avtomatik loglash
7. **Xavfsizlik:** 2FA, parolni reset qilish oqimi, IP-based monitoring

---

*Ushbu hujjat — ishlab chiquvchi jamoa yoki AI-kodlash vositasi (masalan Claude Code) uchun to'liq texnik topshiriq sifatida ishlatilishi mumkin.*
