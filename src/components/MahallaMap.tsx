import type { Mahalla } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { bucketColorFor, computeBuckets } from "@/lib/voronoiMap";
import { DISTRICT_OUTLINE, REGION_LABEL_POS, REGION_PATHS } from "@/lib/districtShapes";
import MapCanvas, { type MapCell } from "@/components/MapCanvas";

export default async function MahallaMap({ mahallas: allMahallas }: { mahallas: Mahalla[] }) {
  // Only the 7 real seed mahallas have a hand-drawn shape — admin-added
  // ones simply don't appear on the map (still fully visible in the
  // grid/list views), same as before.
  const mahallas = allMahallas.filter((m) => REGION_PATHS[m.id]);

  const links = await prisma.bankerMahalla.findMany({
    where: { mahallaId: { in: mahallas.map((m) => m.id) } },
    include: { banker: { select: { ism: true } } },
  });
  const bankerByMahalla = new Map(links.map((l) => [l.mahallaId, l.banker.ism]));

  const populations = mahallas.map((m) => m.aholi);
  const buckets = computeBuckets(populations);

  const cells: MapCell[] = mahallas.map((m) => {
    const [labelCx, labelCy] = REGION_LABEL_POS[m.id];
    return {
      id: m.id,
      nomi: m.nomi,
      aholi: m.aholi,
      tadbirkorlik: m.tadbirkorlik,
      vakansiya: m.vakansiya,
      bankerName: bankerByMahalla.get(m.id) ?? null,
      inactive: m.status === "FAOL_EMAS",
      path: REGION_PATHS[m.id],
      labelCx,
      labelCy,
      color: bucketColorFor(m.aholi, populations),
    };
  });

  return (
    <div className="map-card">
      <h4>Yunusobod tumani — mahallalar xaritasi</h4>
      <p>Mahallani tanlang va batafsil ma&apos;lumotni ko&apos;ring</p>
      <MapCanvas cells={cells} buckets={buckets} outline={DISTRICT_OUTLINE} />
    </div>
  );
}
