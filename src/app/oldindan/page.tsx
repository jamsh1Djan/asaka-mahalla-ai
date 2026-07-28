import OldindanForm from "@/components/OldindanForm";

export const metadata = { title: "Oldindan tasdiq — Asaka Mahalla AI" };

export default function OldindanPage() {
  return (
    <section>
      <div className="wrap" style={{ maxWidth: 640 }}>
        <div className="section-head">
          <div className="section-eyebrow">Oldindan tasdiq</div>
          <h2 className="section-title">To&apos;lov qulayligini tekshirish</h2>
          <p className="section-desc">
            Ma&apos;lumotlarni kiriting — natija darhol, qayta bosishsiz yangilanadi.
          </p>
        </div>
        <OldindanForm />
      </div>
    </section>
  );
}
