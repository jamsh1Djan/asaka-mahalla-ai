import type { Mahalla } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeVoronoiCells, parsePoints, polygonCentroid, roundedPolygonPath } from "@/lib/voronoiMap";
import { CREDIT_PRODUCTS, MAHALLA_YANDEX_LINKS, pickCreditProduct } from "@/lib/data";
import { BUSINESS_IDEAS } from "@/lib/businessIdeas";
import MapDashboardCanvas, { type DashboardCell, type DashboardStats } from "@/components/MapDashboardCanvas";

const BOUNDS: [number, number, number, number] = [15, 15, 505, 385];

// Representative small-business startup cost, used to ground the panel's
// "Mos kreditlar" figure in a real CREDIT_PRODUCTS lookup (same deterministic
// pickCreditProduct the business-plan wizard uses) instead of a per-mahalla
// guess we can't actually back with data.
const TYPICAL_STARTUP_COST = 15_000_000;

export default async function MahallaMapDashboard({ mahallas: allMahallas }: { mahallas: Mahalla[] }) {
  // Same admin-added-mahallas-without-a-shape caveat as the compact map.
  const mahallas = allMahallas.filter(
    (m): m is Mahalla & { mapPoints: string } => !!m.mapPoints
  );

  const links = await prisma.bankerMahalla.findMany({
    where: { mahallaId: { in: mahallas.map((m) => m.id) } },
    include: { banker: { select: { ism: true } } },
  });
  const bankerByMahalla = new Map(links.map((l) => [l.mahallaId, l.banker.ism]));

  const sites = mahallas.map((m) => {
    const { cx, cy } = polygonCentroid(parsePoints(m.mapPoints));
    return [cx, cy] as [number, number];
  });
  const cellPolygons = computeVoronoiCells(sites, BOUNDS);
  const typicalCredit = pickCreditProduct(TYPICAL_STARTUP_COST);

  // No `color` baked in here — the dashboard lets the visitor switch which
  // metric the map is colored by (aholi vs tadbirkorlik), so bucketColorFor
  // runs client-side against whichever one is active instead of a single
  // fixed value computed once on the server.
  const cells: DashboardCell[] = mahallas.map((m, i) => {
    const cellPoints = cellPolygons[i];
    const { cx: labelCx, cy: labelCy } = cellPoints.length
      ? polygonCentroid(cellPoints)
      : { cx: sites[i][0], cy: sites[i][1] };
    return {
      id: m.id,
      nomi: m.nomi,
      aholi: m.aholi,
      oila: m.oila,
      xonadon: m.xonadon,
      tadbirkorlik: m.tadbirkorlik,
      vakansiya: m.vakansiya,
      drayver: m.drayver,
      image: m.image,
      yandexUrl: MAHALLA_YANDEX_LINKS[m.id] ?? null,
      bankerName: bankerByMahalla.get(m.id) ?? null,
      inactive: m.status === "FAOL_EMAS",
      path: roundedPolygonPath(cellPoints, 8),
      labelCx,
      labelCy,
    };
  });

  const stats: DashboardStats = {
    mahallaCount: mahallas.length,
    totalAholi: mahallas.reduce((s, m) => s + m.aholi, 0),
    creditProductCount: CREDIT_PRODUCTS.length,
    ideaCount: BUSINESS_IDEAS.length,
  };

  return (
    <MapDashboardCanvas
      cells={cells}
      stats={stats}
      typicalCredit={{
        nomi: typicalCredit.nomi,
        miqdori: typicalCredit.miqdori,
        foiz: typicalCredit.foiz,
      }}
    />
  );
}
