// Fixed hexagon-flower layout, shared by the compact home-page map and the
// full /mahallalar dashboard map: 1 center cell (Oqtepa) surrounded by 6
// neighbors, standard pointy-top hex-grid math (Red Blob Games axial
// neighbor offsets) so every pair of adjacent hexes shares a real edge —
// no gaps, no overlap.

import {
  Wrench,
  Factory,
  Home,
  Store,
  ShoppingBag,
  ShoppingCart,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export type HexPos = { cx: number; cy: number; order: number };

const CENTER_X = 260;
const CENTER_Y = 200;
export const HEX_SIZE = 78;

const SQ3 = Math.sqrt(3);
const DX = (HEX_SIZE * SQ3) / 2;
const DX_FULL = HEX_SIZE * SQ3;
const DY = HEX_SIZE * 1.5;

/** Numbered 1-7 to match the reference layout: Otchopar-1/2 on top,
 * Muruvvat/Oqtepa/Yurtobod across the middle, Posira/Yangiariq on bottom. */
export const HEX_POSITIONS: Record<string, HexPos> = {
  otchopar1: { cx: CENTER_X - DX, cy: CENTER_Y - DY, order: 1 },
  otchopar2: { cx: CENTER_X + DX, cy: CENTER_Y - DY, order: 2 },
  muruvvat: { cx: CENTER_X - DX_FULL, cy: CENTER_Y, order: 3 },
  oqtepa: { cx: CENTER_X, cy: CENTER_Y, order: 4 },
  yurtobod: { cx: CENTER_X + DX_FULL, cy: CENTER_Y, order: 5 },
  posira: { cx: CENTER_X - DX, cy: CENTER_Y + DY, order: 6 },
  yangiariq: { cx: CENTER_X + DX, cy: CENTER_Y + DY, order: 7 },
};

/** One representative icon per mahalla, picked from its real faoliyatTurlari
 * — Otchopar-1's top listed activities are repair/service shops (Wrench),
 * Otchopar-2 is manufacturing-heavy (Factory), Yangiariq leads with
 * bakeries/milliy taomlar (UtensilsCrossed), etc. Not decoration picked at
 * random, and shared by both map components so they never disagree. */
export const MAHALLA_ICON: Record<string, LucideIcon> = {
  otchopar1: Wrench,
  otchopar2: Factory,
  muruvvat: Home,
  oqtepa: Store,
  yurtobod: ShoppingBag,
  posira: ShoppingCart,
  yangiariq: UtensilsCrossed,
};

type Point = [number, number];

function dist(a: Point, b: Point): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function moveToward(from: Point, to: Point, d: number): Point {
  const len = dist(from, to);
  if (len < 1e-6) return from;
  const t = d / len;
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
}

/** Pointy-top hexagon centered at (cx, cy), corners softly rounded (~radius
 * px, clamped to half the edge length) — a gentle premium-infographic feel
 * instead of sharp hex points. */
export function hexPath(cx: number, cy: number, size: number = HEX_SIZE, radius = 14): string {
  const pts: Point[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (-90 + 60 * i);
    pts.push([cx + size * Math.cos(angle), cy + size * Math.sin(angle)]);
  }
  const n = pts.length;
  const corners = pts.map((curr, i) => {
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    const r1 = Math.min(radius, dist(curr, prev) / 2);
    const r2 = Math.min(radius, dist(curr, next) / 2);
    return { p1: moveToward(curr, prev, r1), p2: moveToward(curr, next, r2) };
  });
  let d = `M ${corners[0].p1[0].toFixed(1)},${corners[0].p1[1].toFixed(1)} `;
  for (let i = 0; i < n; i++) {
    const p2 = corners[i].p2;
    d += `Q ${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)} `;
    const nextCorner = corners[(i + 1) % n];
    d += `L ${nextCorner.p1[0].toFixed(1)},${nextCorner.p1[1].toFixed(1)} `;
  }
  return d + "Z";
}
