// Population/metric -> color bucketing for the mahalla map. The map's
// actual district shapes are hand-authored (see districtShapes.ts) rather
// than computed from these points, but the color-scale logic here is
// shape-agnostic and still used by both map components.

/** Fixed 5-step brand-red scale (pale -> deep red), used as discrete buckets
 * rather than a continuous gradient — easier to read at a glance, and
 * matches the site's actual brand color (var(--red)) instead of an
 * off-brand green. Lowest bucket = smallest value ("Kam"), highest =
 * largest ("Yuqori"). */
const BUCKET_COLORS = ["#FBE4E8", "#F3B4BE", "#E8798B", "#D6455E", "#B01E3A"];

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
