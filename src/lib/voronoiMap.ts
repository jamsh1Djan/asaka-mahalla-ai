import { Delaunay } from "d3-delaunay";

export type Point = [number, number];

/** Area-weighted polygon centroid (not a naive vertex average — an average
 * of vertices pulls toward whichever side has more points and drifts near
 * the edge for irregular shapes; this is the true geometric center). */
export function polygonCentroid(points: Point[]): { cx: number; cy: number } {
  let area = 0;
  let cx = 0;
  let cy = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[(i + 1) % n];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  area *= 0.5;
  if (Math.abs(area) < 1e-6) {
    const avgX = points.reduce((s, [x]) => s + x, 0) / n;
    const avgY = points.reduce((s, [, y]) => s + y, 0) / n;
    return { cx: avgX, cy: avgY };
  }
  return { cx: cx / (6 * area), cy: cy / (6 * area) };
}

/** Parses the "x,y x,y x,y" polygon strings stored on Mahalla.mapPoints. */
export function parsePoints(raw: string): Point[] {
  return raw
    .trim()
    .split(/\s+/)
    .map((p) => {
      const [x, y] = p.split(",").map(Number);
      return [x, y] as Point;
    });
}

/** Voronoi tessellation of the given site points, clipped to `bounds`
 * ([xmin, ymin, xmax, ymax]). Returns one closed ring per site, in the same
 * order as the input — a mathematically consistent, gapless partition of
 * the map area instead of hand-drawn shapes. */
export function computeVoronoiCells(
  sites: Point[],
  bounds: [number, number, number, number]
): Point[][] {
  const delaunay = Delaunay.from(sites);
  const voronoi = delaunay.voronoi(bounds);
  return sites.map((_, i) => {
    const cell = voronoi.cellPolygon(i);
    return (cell ?? []) as Point[];
  });
}

export function pointsToPath(points: Point[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return `M ${first[0]},${first[1]} ` + rest.map(([x, y]) => `L ${x},${y}`).join(" ") + " Z";
}

function dist(a: Point, b: Point): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function moveToward(from: Point, to: Point, d: number): Point {
  const len = dist(from, to);
  if (len < 1e-6) return from;
  const t = d / len;
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
}

/** Renders the polygon as straight edges with each corner replaced by a
 * small quadratic-curve fillet (~`radius` px, clamped to half the shorter
 * adjacent edge) — a controlled "soft-cornered polygon", not a freeform
 * blob: edges stay straight, only the corners round off. */
export function roundedPolygonPath(ring: Point[], radius = 8): string {
  let pts = ring;
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (pts.length > 1 && first[0] === last[0] && first[1] === last[1]) {
    pts = pts.slice(0, -1);
  }
  const n = pts.length;
  if (n < 3) return pointsToPath(pts);

  const corners = pts.map((curr, i) => {
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    const r1 = Math.min(radius, dist(curr, prev) / 2);
    const r2 = Math.min(radius, dist(curr, next) / 2);
    return { p1: moveToward(curr, prev, r1), p2: moveToward(curr, next, r2) };
  });

  let d = `M ${corners[0].p1[0]},${corners[0].p1[1]} `;
  for (let i = 0; i < n; i++) {
    const p2 = corners[i].p2;
    d += `Q ${pts[i][0]},${pts[i][1]} ${p2[0]},${p2[1]} `;
    const nextCorner = corners[(i + 1) % n];
    d += `L ${nextCorner.p1[0]},${nextCorner.p1[1]} `;
  }
  return d + "Z";
}

/** Fixed 5-step green scale (pale -> deep green), used as discrete buckets
 * rather than a continuous gradient — easier to read at a glance. Lowest
 * bucket = smallest population ("Kam"), highest = largest ("Yuqori"). */
const BUCKET_COLORS = ["#E8F5E9", "#B9E4BE", "#7FCB8C", "#43A85A", "#1F7A3D"];

export type PopulationBucket = { color: string; min: number; max: number };

/** Splits [min(values), max(values)] into BUCKET_COLORS.length equal-width
 * ranges and returns each bucket's color + numeric range, for the legend. */
export function computeBuckets(values: number[]): PopulationBucket[] {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = (hi - lo) / BUCKET_COLORS.length || 1;
  return BUCKET_COLORS.map((color, i) => ({
    color,
    min: Math.round(lo + span * i),
    max: i === BUCKET_COLORS.length - 1 ? hi : Math.round(lo + span * (i + 1)),
  }));
}

export function bucketColorFor(value: number, values: number[]): string {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = (hi - lo) / BUCKET_COLORS.length || 1;
  const idx = Math.min(BUCKET_COLORS.length - 1, Math.max(0, Math.floor((value - lo) / span)));
  return BUCKET_COLORS[idx];
}
