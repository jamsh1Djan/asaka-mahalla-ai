import OldindanForm from "@/components/OldindanForm";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Oldindan tasdiq — Asaka Mahalla AI" };

export default function OldindanPage() {
  return (
    <section>
      <div className="wrap" style={{ maxWidth: 640 }}>
        <Reveal>
          <div className="section-head">
            <div className="section-eyebrow">Oldindan tasdiq</div>
            <h2 className="section-title">To&apos;lov qulayligini tekshirish</h2>
            <p className="section-desc">
              Ma&apos;lumotlarni kiriting — natija darhol, qayta bosishsiz yangilanadi.
            </p>
          </div>
        </Reveal>
        <Reveal variant="scale" delay={100}>
          <OldindanForm />
        </Reveal>
      </div>
    </section>
  );
}
