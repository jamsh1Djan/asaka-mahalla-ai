import Calculator from "@/components/Calculator";

export const metadata = { title: "Kalkulyator — Asaka Mahalla AI" };

export default function KalkulyatorPage() {
  return (
    <section>
      <div className="wrap" style={{ maxWidth: 720 }}>
        <div className="section-head">
          <div className="section-eyebrow">Kalkulyator</div>
          <h2 className="section-title">Kredit to&apos;lovini hisoblang</h2>
          <p className="section-desc">
            Summani va muddatni o&apos;zgartiring — natija darhol yangilanadi.
          </p>
        </div>
        <Calculator />
      </div>
    </section>
  );
}
