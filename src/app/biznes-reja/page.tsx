import { prisma } from "@/lib/prisma";
import BusinessPlanWizard from "@/components/BusinessPlanWizard";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Biznes reja yordamchisi — Asaka Mahalla AI" };

export default async function BiznesRejaPage() {
  const mahallas = await prisma.mahalla.findMany({ orderBy: { nomi: "asc" } });

  return (
    <section>
      <div className="wrap">
        <Reveal>
          <div className="section-head">
            <div className="section-eyebrow">Biznes reja yordamchisi</div>
            <h2 className="section-title">Mahallangizga mos biznes g&apos;oyasini toping</h2>
            <p className="section-desc">
              Mahallangizni tanlang, qisqa so&apos;rovnomani to&apos;ldiring — sun&apos;iy
              intellekt sizga mos biznes g&apos;oyasi va kredit dasturini taklif qiladi.
            </p>
          </div>
        </Reveal>
        <BusinessPlanWizard mahallas={mahallas} />
      </div>
    </section>
  );
}
