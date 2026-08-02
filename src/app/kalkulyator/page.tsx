import Calculator from "@/components/Calculator";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Kalkulyator — Asaka Mahalla AI" };

export default function KalkulyatorPage() {
  return (
    <section>
      <div className="wrap">
        <Reveal>
          <div className="section-head">
            <div className="section-eyebrow">Kalkulyator</div>
            <h2 className="section-title">Kreditni hisoblang</h2>
            <p className="section-desc">
              Miqdor va muddatni tanlang — oylik to&apos;lov jonli o&apos;zgaradi, jadval avtomatik
              shakllanadi.
            </p>
          </div>
        </Reveal>
        <Reveal variant="scale" delay={100}>
          <Calculator />
        </Reveal>
      </div>
    </section>
  );
}
