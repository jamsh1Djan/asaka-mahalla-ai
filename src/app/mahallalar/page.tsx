import { prisma } from "@/lib/prisma";
import MahallaMap from "@/components/MahallaMap";
import MahallaCard from "@/components/MahallaCard";

export const metadata = { title: "Mahallalar — Asaka Mahalla AI" };

export default async function MahallalarPage() {
  const mahallas = await prisma.mahalla.findMany({ orderBy: { nomi: "asc" } });

  return (
    <section>
      <div className="wrap">
        <div className="section-head">
          <div className="section-eyebrow">O&apos;z mahallangizni tanlang</div>
          <h2 className="section-title">Yunusobod tumani — barcha mahallalar</h2>
          <p className="section-desc">
            Mahallani tanlang: bankir ma&apos;lumoti, ko&apos;rsatkichlar va AI
            biznes-tavsiyalarini ko&apos;ring.
          </p>
        </div>
        <MahallaMap mahallas={mahallas} />
        <div style={{ height: 26 }} />
        <div className="grid grid-3">
          {mahallas.map((m) => (
            <MahallaCard key={m.id} m={m} />
          ))}
        </div>
      </div>
    </section>
  );
}
