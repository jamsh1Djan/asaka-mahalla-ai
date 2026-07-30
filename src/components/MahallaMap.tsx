import type { Mahalla } from "@prisma/client";
import { computeVoronoiCells, heatColor, parsePoints, pointsToPath, polygonCentroid } from "@/lib/voronoiMap";
import MapCanvas, { type MapCell } from "@/components/MapCanvas";

const BOUNDS: [number, number, number, number] = [15, 15, 505, 385];

export default function MahallaMap({ mahallas: allMahallas }: { mahallas: Mahalla[] }) {
  // Admin-added mahallas have no hand-drawn reference point yet — they simply
  // don't appear on the map (still fully visible in the grid/list views).
  const mahallas = allMahallas.filter(
    (m): m is Mahalla & { mapPoints: string } => !!m.mapPoints
  );

  // The original hand-drawn pentagons are no longer rendered directly — their
  // true (area-weighted) centroids become Voronoi sites, so the map area is
  // partitioned mathematically instead of by hand-picked coordinates.
  const sites = mahallas.map((m) => {
    const { cx, cy } = polygonCentroid(parsePoints(m.mapPoints));
    return [cx, cy] as [number, number];
  });
  const cellPolygons = computeVoronoiCells(sites, BOUNDS);

  const populations = mahallas.map((m) => m.aholi);
  const minPop = Math.min(...populations);
  const maxPop = Math.max(...populations);

  const cells: MapCell[] = mahallas.map((m, i) => {
    const cellPoints = cellPolygons[i];
    const { cx: labelCx, cy: labelCy } = cellPoints.length ? polygonCentroid(cellPoints) : { cx: sites[i][0], cy: sites[i][1] };
    return {
      id: m.id,
      nomi: m.nomi,
      aholi: m.aholi,
      tadbirkorlik: m.tadbirkorlik,
      vakansiya: m.vakansiya,
      inactive: m.status === "FAOL_EMAS",
      path: pointsToPath(cellPoints),
      labelCx,
      labelCy,
      color: heatColor(m.aholi, minPop, maxPop),
    };
  });

  return (
    <div className="map-card">
      <h4>Yunusobod tumani — mahallalar xaritasi</h4>
      <p>Mahallani tanlang va batafsil ma&apos;lumotni ko&apos;ring</p>
      <MapCanvas cells={cells} />
    </div>
  );
}
