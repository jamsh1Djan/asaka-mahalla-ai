import type { Mahalla } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  bucketColorFor,
  computeBuckets,
  computeVoronoiCells,
  districtOutlinePath,
  parsePoints,
  polygonCentroid,
  roundedPolygonPath,
} from "@/lib/voronoiMap";
import MapCanvas, { type MapCell } from "@/components/MapCanvas";

// Modestly oversized relative to the 520x400 viewBox so cells extend past
// the organic outline clip's edges (the visible shape comes from the
// clipPath, not this rectangle) — but not so oversized that an outer
// cell's true unclipped extent balloons and drags its centroid (used for
// the label position) into an area the clip removes.
const BOUNDS: [number, number, number, number] = [-30, -30, 550, 430];

export default async function MahallaMap({ mahallas: allMahallas }: { mahallas: Mahalla[] }) {
  // Admin-added mahallas have no hand-drawn reference point yet — they simply
  // don't appear on the map (still fully visible in the grid/list views).
  const mahallas = allMahallas.filter(
    (m): m is Mahalla & { mapPoints: string } => !!m.mapPoints
  );

  const links = await prisma.bankerMahalla.findMany({
    where: { mahallaId: { in: mahallas.map((m) => m.id) } },
    include: { banker: { select: { ism: true } } },
  });
  const bankerByMahalla = new Map(links.map((l) => [l.mahallaId, l.banker.ism]));

  // The centroids of the original hand-drawn reference shapes become Voronoi
  // sites, so the map area is partitioned mathematically instead of by
  // hand-picked coordinates.
  const sites = mahallas.map((m) => {
    const { cx, cy } = polygonCentroid(parsePoints(m.mapPoints));
    return [cx, cy] as [number, number];
  });
  const cellPolygons = computeVoronoiCells(sites, BOUNDS);
  const outline = districtOutlinePath(mahallas.flatMap((m) => parsePoints(m.mapPoints)));

  const populations = mahallas.map((m) => m.aholi);
  const buckets = computeBuckets(populations);

  const cells: MapCell[] = mahallas.map((m, i) => {
    const cellPoints = cellPolygons[i];
    const { cx: labelCx, cy: labelCy } = cellPoints.length ? polygonCentroid(cellPoints) : { cx: sites[i][0], cy: sites[i][1] };
    return {
      id: m.id,
      nomi: m.nomi,
      aholi: m.aholi,
      tadbirkorlik: m.tadbirkorlik,
      vakansiya: m.vakansiya,
      bankerName: bankerByMahalla.get(m.id) ?? null,
      inactive: m.status === "FAOL_EMAS",
      path: roundedPolygonPath(cellPoints, 8),
      labelCx,
      labelCy,
      color: bucketColorFor(m.aholi, populations),
    };
  });

  return (
    <div className="map-card">
      <h4>Yunusobod tumani — mahallalar xaritasi</h4>
      <p>Mahallani tanlang va batafsil ma&apos;lumotni ko&apos;ring</p>
      <MapCanvas cells={cells} buckets={buckets} outline={outline} />
    </div>
  );
}
