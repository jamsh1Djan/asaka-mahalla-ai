import { prisma } from "@/lib/prisma";
import MahallaMap from "@/components/MahallaMap";
import MahallaCard from "@/components/MahallaCard";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Mahallalar — Asaka Mahalla AI" };

export default async function MahallalarPage() {
  const mahallas = await prisma.mahalla.findMany({ orderBy: { nomi: "asc" } });

  return (
    <section>
      <div className="wrap">
        <Reveal>
          <div className="section-head">
            <div className="section-eyebrow">O&apos;z mahallangizni tanlang</div>
            <h2 className="section-title">Yunusobod tumani — barcha mahallalar</h2>
            <p className="section-desc">
              Mahallani tanlang: bankir ma&apos;lumoti, ko&apos;rsatkichlar va AI
              biznes-tavsiyalarini ko&apos;ring.
            </p>
          </div>
        </Reveal>
        <Reveal variant="scale" delay={100}>
          <MahallaMap mahallas={mahallas} />
        </Reveal>
        <div style={{ height: 26 }} />
        <div className="grid grid-3">
          {mahallas.map((m, i) => (
            <Reveal key={m.id} variant="scale" onView delay={i * 70}>
              <MahallaCard m={m} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
