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
 * order as the input — a mathematically consistent partition of the map
 * area instead of hand-drawn shapes. */
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

/** Chaikin corner-cutting: replaces each vertex with two points at 25%/75%
 * along its edges. A couple of passes turns a hard-edged polygon into a
 * softly rounded outline without changing its footprint much. */
function chaikinSmooth(points: Point[], iterations: number): Point[] {
  let pts = points;
  for (let pass = 0; pass < iterations; pass++) {
    const next: Point[] = [];
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % n];
      next.push([x0 + (x1 - x0) * 0.25, y0 + (y1 - y0) * 0.25]);
      next.push([x0 + (x1 - x0) * 0.75, y0 + (y1 - y0) * 0.75]);
    }
    pts = next;
  }
  return pts;
}

/** Renders a closed ring of points as a continuously smooth (tangent-
 * continuous) curve — a chain of quadratic Beziers through edge midpoints,
 * the standard "smooth freehand blob from a polygon" construction. */
function smoothPathFromPoints(points: Point[]): string {
  const n = points.length;
  if (n < 3) return pointsToPath(points);
  const [lx, ly] = points[n - 1];
  const [fx, fy] = points[0];
  let d = `M ${(fx + lx) / 2},${(fy + ly) / 2} `;
  for (let i = 0; i < n; i++) {
    const [cx, cy] = points[i];
    const [nx, ny] = points[(i + 1) % n];
    d += `Q ${cx},${cy} ${(cx + nx) / 2},${(cy + ny) / 2} `;
  }
  return d + "Z";
}

/** Turns a Voronoi cell (straight-edged, often just 4-5 sides for a handful
 * of sites — reads as plain geometric blocks) into an organic rounded blob
 * outline, so the map doesn't look like a grid of quadrilaterals. */
export function organicCellPath(ring: Point[], iterations = 2): string {
  if (ring.length === 0) return "";
  let pts = ring;
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (pts.length > 1 && first[0] === last[0] && first[1] === last[1]) {
    pts = pts.slice(0, -1);
  }
  return smoothPathFromPoints(chaikinSmooth(pts, iterations));
}

const HEAT_LIGHT: [number, number, number] = [0xf7, 0xd9, 0xde]; // faint red tint
const HEAT_DARK: [number, number, number] = [0xc4, 0x1e, 0x3a]; // brand red #C41E3A
const HEAT_STEPS = 5;

/** Quantized 5-step heatmap: population -> shade of the brand red, so color
 * directly encodes "aholi soni" instead of an arbitrary per-mahalla hue. */
export function heatColor(value: number, min: number, max: number): string {
  const t = max > min ? (value - min) / (max - min) : 0.5;
  const step = Math.min(HEAT_STEPS - 1, Math.floor(t * HEAT_STEPS));
  const stepT = HEAT_STEPS > 1 ? step / (HEAT_STEPS - 1) : 1;
  const [r, g, b] = HEAT_LIGHT.map((c, i) => c + (HEAT_DARK[i] - c) * stepT);
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

export function heatSteps(): string[] {
  return Array.from({ length: HEAT_STEPS }, (_, step) => {
    const stepT = HEAT_STEPS > 1 ? step / (HEAT_STEPS - 1) : 1;
    const [r, g, b] = HEAT_LIGHT.map((c, i) => c + (HEAT_DARK[i] - c) * stepT);
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  });
}
