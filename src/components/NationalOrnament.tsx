import { useId } from "react";

/** Girih — the interlocking square/diamond lattice behind classical Islamic
 * geometric screens (mashrabiya/panjara) and the basis of most Uzbek
 * architectural ornament. This is the site's one deliberately "milliy"
 * touch, used in exactly one place (the footer's top edge) at a very low
 * opacity — a background texture, not a colored, competing element. */
export default function NationalOrnament({
  variant = "light",
  height = 40,
}: {
  variant?: "light" | "dark";
  height?: number;
}) {
  const uid = useId().replace(/[:]/g, "");
  const line = variant === "dark" ? "#E0BF5C" : "#0A1F44";
  const opacity = variant === "dark" ? 0.16 : 0.06;
  const tile = 24;

  return (
    <div className="ornament-band" style={{ height }} aria-hidden="true">
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox={`0 0 ${tile * 4} ${tile}`}>
        <defs>
          <pattern id={`girih-${uid}`} width={tile} height={tile} patternUnits="userSpaceOnUse">
            <rect x="0.5" y="0.5" width={tile - 1} height={tile - 1} fill="none" stroke={line} strokeWidth="1" />
            <path
              d={`M ${tile / 2} 0 L ${tile} ${tile / 2} L ${tile / 2} ${tile} L 0 ${tile / 2} Z`}
              fill="none"
              stroke={line}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#girih-${uid})`} opacity={opacity} />
      </svg>
    </div>
  );
}
