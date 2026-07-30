import { CREDIT_PRODUCTS, IMTIYOZLAR } from "@/lib/data";
import CreditCard from "@/components/CreditCard";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Kreditlar — Asaka Mahalla AI" };

export default function KreditlarPage() {
  return (
    <section>
      <div className="wrap">
        <div className="section-head">
          <div className="section-eyebrow">Kredit mahsulotlari</div>
          <h2 className="section-title">Barcha kredit turlari</h2>
          <p className="section-desc">
            Aholi bandligini ta&apos;minlash bo&apos;yicha jismoniy va yuridik shaxslarga taklif
            etiladigan kredit mahsulotlari.
          </p>
        </div>
        <div className="grid grid-3">
          {CREDIT_PRODUCTS.map((c, i) => (
            <Reveal key={c.id} variant="scale" onView delay={i * 80}>
              <CreditCard c={c} />
            </Reveal>
          ))}
        </div>

        <div className="section-head" style={{ marginTop: 50 }}>
          <div className="section-eyebrow">PQ-49 · 05.02.2026</div>
          <h2 className="section-title">
            Tadbirkorlikni rivojlantirish bo&apos;yicha imtiyoz va kompensatsiyalar
          </h2>
          <p className="section-desc">
            O&apos;zbekiston Respublikasi Prezidentining hududlarni rivojlantirish
            to&apos;g&apos;risidagi qarori asosidagi imtiyozlar.
          </p>
        </div>
        <div className="grid grid-2">
          {IMTIYOZLAR.map((i, idx) => (
            <Reveal key={idx} onView delay={idx * 70}>
              <div className="card imtiyoz-card">
                <div className="num">{i.num}</div>
                <div className="txt">{i.txt}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
