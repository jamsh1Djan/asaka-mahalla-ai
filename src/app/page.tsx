import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { fmt } from "@/lib/format";
import { CREDIT_PRODUCTS } from "@/lib/data";
import MahallaMap from "@/components/MahallaMap";
import CreditCard from "@/components/CreditCard";
import MahallaCard from "@/components/MahallaCard";
import Reveal from "@/components/Reveal";
import MotionLink from "@/components/MotionLink";
import OpenAiChatButton from "@/components/OpenAiChatButton";
import HeroShowcase from "@/components/HeroShowcase";

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
            <Reveal delay={0}>
              <div className="eyebrow">
                <span className="dot" /> Asaka Digital · Yunusobod BXM
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="hero-title">
                Mahallangiz uchun
                <br />
                <span className="accent">kreditdan maslahatgacha — hammasi AI bilan</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="hero-sub">
                Kredit tanlash, ariza berish, mahalla bankiri bilan bog&apos;lanish, imtiyozlarni
                ko&apos;rish — hammasi bir platformada, sun&apos;iy intellekt yordamida.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="hero-cta">
                <OpenAiChatButton className="btn btn-primary">
                  <Sparkles size={16} />
                  AI yordamchi bilan boshlash
                </OpenAiChatButton>
                <MotionLink href="/biznes-reja" className="btn btn-outline">
                  Biznes reja yordamchisi
                  <ArrowRight size={16} />
                </MotionLink>
              </div>
            </Reveal>
            <Reveal delay={320}>
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
            </Reveal>
          </div>
          <Reveal variant="scale" delay={200} className="hero-visual">
            <HeroShowcase />
          </Reveal>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal onView className="benefits-block">
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
                  <CheckCircle2 size={17} className="ic" /> Garovsiz kreditlar — 150 mln so&apos;mgacha
                </li>
                <li>
                  <CheckCircle2 size={17} className="ic" /> AI orqali mahallangizga mos biznes g&apos;oyasi
                </li>
                <li>
                  <CheckCircle2 size={17} className="ic" /> Mahalla bankiri bilan to&apos;g&apos;ridan-to&apos;g&apos;ri aloqa
                </li>
              </ul>
              <Link href="/mahallalar" className="btn btn-primary">
                Mahallamni tanlash
                <ArrowRight size={16} />
              </Link>
            </div>
            <MahallaMap mahallas={mahallas} />
          </Reveal>
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
            {CREDIT_PRODUCTS.slice(0, 3).map((c, i) => (
              <Reveal key={c.id} variant="scale" onView delay={i * 90}>
                <CreditCard c={c} />
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Link href="/kreditlar" className="btn btn-outline">
              Barcha kreditlarni ko&apos;rish
              <ArrowRight size={16} />
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
            {mahallas.slice(0, 3).map((m, i) => (
              <Reveal key={m.id} variant="scale" onView delay={i * 90}>
                <MahallaCard m={m} />
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Link href="/mahallalar" className="btn btn-outline">
              Barcha mahallalarni ko&apos;rish
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
