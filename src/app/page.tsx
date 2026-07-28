import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fmt } from "@/lib/format";
import { CREDIT_PRODUCTS } from "@/lib/data";
import MahallaMap from "@/components/MahallaMap";
import CreditCard from "@/components/CreditCard";
import MahallaCard from "@/components/MahallaCard";

export default async function HomePage() {
  const mahallas = await prisma.mahalla.findMany({ orderBy: { nomi: "asc" } });
  const totalAholi = mahallas.reduce((s, m) => s + m.aholi, 0);
  const totalTadbirkor = mahallas.reduce((s, m) => s + m.tadbirkorlik, 0);
  const totalVakansiya = mahallas.reduce((s, m) => s + m.vakansiya, 0);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow">
              <span className="dot" /> Asaka Digital · Yunusobod BXM
            </div>
            <h1 className="hero-title">
              Bankka bormasdan <span className="accent">barcha bank ishlarini</span> bajaring
            </h1>
            <p className="hero-sub">
              Kredit tanlash, ariza berish, mahalla bankiri bilan bog&apos;lanish, imtiyozlarni
              ko&apos;rish — hammasi bir platformada, sun&apos;iy intellekt yordamida.
            </p>
            <div className="hero-cta">
              <Link href="/mahallalar" className="btn btn-primary">
                ✨ AI yordamchi bilan boshlash
              </Link>
              <Link href="/oldindan" className="btn btn-outline">
                Oldindan tasdiqni tekshirish →
              </Link>
            </div>
            <div className="stat-row">
              <div className="stat-item">
                <div className="stat-num">{mahallas.length}</div>
                <div className="stat-label">Ulangan mahallalar</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">{fmt(totalAholi)}</div>
                <div className="stat-label">Jami aholi</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">{fmt(totalTadbirkor)}</div>
                <div className="stat-label">Tadbirkorlik subyektlari</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">{fmt(totalVakansiya)}</div>
                <div className="stat-label">Bo&apos;sh ish o&apos;rinlari</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="chatbox">
              <div className="chat-row">
                <div className="chat-avatar">AI</div>
                <div className="chat-bubble">
                  Assalomu alaykum! Kredit yoki biznes reja bo&apos;yicha yordam beraymi?
                </div>
              </div>
              <div className="chat-row me">
                <div className="chat-avatar">Siz</div>
                <div className="chat-bubble">
                  Menga 20 million kredit kerak, o&apos;zimni o&apos;zim band qilganman
                </div>
              </div>
              <div className="chat-row">
                <div className="chat-avatar">AI</div>
                <div className="chat-bubble">
                  Sizga <b>Biznesga birinchi qadam 2.0</b> (17 mln, 27%) mos keladi. Batafsil
                  ko&apos;raymi?
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="benefits-block">
            <div>
              <h3>
                Mahallangiz ixtisoslashuvi va faoliyat turingizga qarab siz olishingiz mumkin
                bo&apos;lgan imtiyozlar
              </h3>
              <p className="section-desc">
                Har bir mahalla o&apos;ziga xos iqtisodiy yo&apos;nalishga ega — PQ-49
                imtiyozlari, biznes g&apos;oyalari va kredit tavsiyalari shu asosida
                shakllantiriladi.
              </p>
              <ul className="benefits-list">
                <li>
                  <span className="ic">✓</span> Garovsiz kreditlar — 150 mln so&apos;mgacha
                </li>
                <li>
                  <span className="ic">✓</span> AI orqali mahallangizga mos biznes g&apos;oyasi
                </li>
                <li>
                  <span className="ic">✓</span> Mahalla bankiri bilan to&apos;g&apos;ridan-to&apos;g&apos;ri aloqa
                </li>
              </ul>
              <Link href="/mahallalar" className="btn btn-primary">
                Mahallamni tanlash →
              </Link>
            </div>
            <MahallaMap mahallas={mahallas} />
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">Kredit mahsulotlari</div>
            <h2 className="section-title">Mahalla bankiri uchun eng kerakli kreditlar</h2>
            <p className="section-desc">
              Jismoniy va yuridik shaxslar uchun Asakabank kredit mahsulotlari — bir joyda.
            </p>
          </div>
          <div className="grid grid-3">
            {CREDIT_PRODUCTS.slice(0, 3).map((c) => (
              <CreditCard key={c.id} c={c} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Link href="/kreditlar" className="btn btn-outline">
              Barcha kreditlarni ko&apos;rish →
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="section-eyebrow">O&apos;z mahallangizni tanlang</div>
            <h2 className="section-title">Yunusobod tumani mahallalari</h2>
            <p className="section-desc">
              Har bir mahalla — o&apos;z bankiri, ko&apos;rsatkichlari va biznes imkoniyatlari
              bilan.
            </p>
          </div>
          <div className="grid grid-3">
            {mahallas.slice(0, 3).map((m) => (
              <MahallaCard key={m.id} m={m} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Link href="/mahallalar" className="btn btn-outline">
              Barcha mahallalarni ko&apos;rish →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
