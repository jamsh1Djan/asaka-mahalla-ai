import type { Mahalla } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { bucketColorFor, computeBuckets } from "@/lib/voronoiMap";
import { HEX_POSITIONS, hexPath } from "@/lib/hexMap";
import MapCanvas, { type MapCell } from "@/components/MapCanvas";

export default async function MahallaMap({ mahallas: allMahallas }: { mahallas: Mahalla[] }) {
  // Only the 7 real seed mahallas have a fixed hex position — admin-added
  // ones simply don't appear on the map (still fully visible in the
  // grid/list views).
  const mahallas = allMahallas.filter((m) => HEX_POSITIONS[m.id]);

  const links = await prisma.bankerMahalla.findMany({
    where: { mahallaId: { in: mahallas.map((m) => m.id) } },
    include: { banker: { select: { ism: true } } },
  });
  const bankerByMahalla = new Map(links.map((l) => [l.mahallaId, l.banker.ism]));

  const populations = mahallas.map((m) => m.aholi);
  const buckets = computeBuckets(populations);
  const totalAholi = mahallas.reduce((s, m) => s + m.aholi, 0);

  const cells: MapCell[] = mahallas.map((m) => {
    const pos = HEX_POSITIONS[m.id];
    return {
      id: m.id,
      nomi: m.nomi,
      aholi: m.aholi,
      tadbirkorlik: m.tadbirkorlik,
      vakansiya: m.vakansiya,
      bankerName: bankerByMahalla.get(m.id) ?? null,
      inactive: m.status === "FAOL_EMAS",
      path: hexPath(pos.cx, pos.cy),
      cx: pos.cx,
      cy: pos.cy,
      order: pos.order,
      color: bucketColorFor(m.aholi, populations),
    };
  });

  return (
    <div className="map-card">
      <h4>Yunusobod tumani — mahallalar xaritasi</h4>
      <p>Mahallani tanlang va batafsil ma&apos;lumotni ko&apos;ring</p>
      <MapCanvas cells={cells} buckets={buckets} totalAholi={totalAholi} />
    </div>
  );
}
