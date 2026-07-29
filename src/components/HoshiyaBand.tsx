import { useId } from "react";

/** Signature ornament band — the site's repeating "hoshiya" motif.
 * Used to divide every major block (header, hero, stats, map, footer)
 * instead of a generic border-radius/line. */
export default function HoshiyaBand({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const uid = useId().replace(/[:]/g, "");
  const gold = variant === "dark" ? "#e0bf5c" : "var(--gold)";
  const teal = variant === "dark" ? "#4f8fa3" : "var(--teal)";

  return (
    <div className={`hoshiya-band ${variant === "dark" ? "dark" : ""}`} aria-hidden="true">
      <svg width="100%" height="15" preserveAspectRatio="none" viewBox="0 0 80 15">
        <defs>
          <pattern id={`hoshiya-${uid}`} width="40" height="15" patternUnits="userSpaceOnUse">
            <path
              d="M0 7.5 Q10 -1 20 7.5 Q30 16 40 7.5"
              fill="none"
              stroke={teal}
              strokeWidth="1.3"
              opacity="0.65"
            />
            <path
              d="M-2 12.5 Q10 6 20 12.5 Q30 19 42 12.5"
              fill="none"
              stroke={gold}
              strokeWidth="1"
              opacity="0.55"
            />
            <circle cx="0" cy="7.5" r="2.3" fill={gold} />
            <circle cx="20" cy="7.5" r="1.4" fill={gold} opacity="0.9" />
            <circle cx="40" cy="7.5" r="2.3" fill={gold} />
          </pattern>
        </defs>
        <rect width="80" height="15" fill={`url(#hoshiya-${uid})`} />
      </svg>
    </div>
  );
}
