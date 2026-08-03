// Hand-authored Yunusobod district shapes — NOT a Voronoi/Delaunay
// tessellation. Real district maps are irregular and asymmetric, not a
// tidy hexagon flower around one center, so these 7 mahalla boundaries are
// drawn as an irregular vertex/edge graph with organic (wavy, unequal)
// bezier curves instead of straight or mathematically-derived edges.
//
// Every internal boundary is defined ONCE, keyed by its two endpoint
// names, and reused by both neighboring regions (walked forward by one,
// backward by the other) — this is what guarantees the shared edge is
// pixel-identical on both sides, so there's never a gap or overlap between
// adjacent mahallas, however wobbly the curve is.

type Vec = [number, number];

const VERTS: Record<string, Vec> = {
  // Outer perimeter, roughly clockwise from the west.
  V1: [55, 110],
  V2: [95, 35],
  V3: [230, 18],
  V4: [365, 45],
  V5: [460, 95],
  V6: [495, 210],
  V7: [460, 320],
  V8: [350, 375],
  V9: [210, 385],
  V10: [95, 340],
  V11: [35, 250],
  // Interior junctions where 3 mahallas meet.
  J1: [200, 130], // Muruvvat / Otchopar-1 / Oqtepa
  J2: [330, 115], // Otchopar-1 / Otchopar-2 / Oqtepa
  J3: [350, 260], // Otchopar-2(via Yurtobod) / Yurtobod / Oqtepa
  J4: [170, 230], // Posira / Muruvvat / Oqtepa
  J5: [240, 300], // Yangiariq / Posira / Oqtepa
};

// [bulge1, bulge2] px offsets (perpendicular to the straight A->B line, at
// the 1/3 and 2/3 points) for each edge's cubic bezier control points.
// Deliberately uneven per edge — no two edges share the same waviness, so
// the outline reads as hand-drawn rather than a repeating pattern.
const EDGES: Record<string, [number, number]> = {
  "V1-V2": [18, -10],
  "V2-V3": [-22, 15],
  "V3-V4": [20, -18],
  "V4-V5": [-15, 25],
  "V5-V6": [30, -12],
  "V6-V7": [-25, 20],
  "V7-V8": [22, -30],
  "V8-V9": [-18, 15],
  "V9-V10": [25, -20],
  "V10-V11": [-15, 10],
  "V11-V1": [15, -25],
  "V2-J1": [12, -8],
  "V4-J2": [-10, 14],
  "V6-J2": [16, -12],
  "V8-J3": [-14, 10],
  "V10-J5": [12, -16],
  "V11-J4": [-10, 14],
  "J1-J2": [8, -10],
  "J2-J3": [-12, 9],
  "J3-J5": [10, -8],
  "J5-J4": [-9, 11],
  "J4-J1": [8, -10],
};

function bezierSeg(from: string, to: string): string {
  const forward = EDGES[`${from}-${to}`];
  const backward = EDGES[`${to}-${from}`];
  const [canonA, canonB, b1, b2] = forward
    ? [from, to, forward[0], forward[1]]
    : ([to, from, backward[0], backward[1]] as const);

  const [ax, ay] = VERTS[canonA];
  const [bx, by] = VERTS[canonB];
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  const c1x = ax + dx * 0.33 + nx * b1;
  const c1y = ay + dy * 0.33 + ny * b1;
  const c2x = ax + dx * 0.66 + nx * b2;
  const c2y = ay + dy * 0.66 + ny * b2;
  const [ex, ey] = VERTS[to];

  // Same two control points either way (identical physical curve) — just
  // emitted in reverse order when walking the edge backward, which is what
  // reverses a cubic bezier's direction correctly.
  return forward
    ? `C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${ex},${ey}`
    : `C ${c2x.toFixed(1)},${c2y.toFixed(1)} ${c1x.toFixed(1)},${c1y.toFixed(1)} ${ex},${ey}`;
}

function buildPath(vertexSeq: string[]): string {
  const [fx, fy] = VERTS[vertexSeq[0]];
  let d = `M ${fx},${fy} `;
  for (let i = 0; i < vertexSeq.length; i++) {
    const from = vertexSeq[i];
    const to = vertexSeq[(i + 1) % vertexSeq.length];
    d += bezierSeg(from, to) + " ";
  }
  return d.trim() + " Z";
}

export const REGION_PATHS: Record<string, string> = {
  oqtepa: buildPath(["J1", "J2", "J3", "J5", "J4"]),
  otchopar1: buildPath(["V2", "V3", "V4", "J2", "J1"]),
  otchopar2: buildPath(["V4", "V5", "V6", "J2"]),
  yurtobod: buildPath(["J2", "V6", "V7", "V8", "J3"]),
  yangiariq: buildPath(["J3", "V8", "V9", "V10", "J5"]),
  posira: buildPath(["J5", "V10", "V11", "J4"]),
  muruvvat: buildPath(["J4", "V11", "V1", "V2", "J1"]),
};

/** The whole district's outer silhouette — the same 11 perimeter edges the
 * 6 outer mahallas already use for their own outer sides, so it lines up
 * with them exactly. Used to clip/tint the map's background. */
export const DISTRICT_OUTLINE = buildPath(["V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V1"]);

/** Hand-placed label anchor per region — a reasonable interior point for
 * each irregular blob, not a computed centroid (some of these shapes are
 * concave enough that a true centroid could land near an edge). */
export const REGION_LABEL_POS: Record<string, [number, number]> = {
  muruvvat: [130, 170],
  otchopar1: [280, 85],
  otchopar2: [410, 140],
  yurtobod: [400, 240],
  yangiariq: [270, 330],
  posira: [140, 290],
  oqtepa: [260, 205],
};
