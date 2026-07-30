import { useId } from "react";

/** A restrained girih/hoshiya-style ornament band — the one deliberately
 * "milliy" (national) accent in an otherwise modern interface, used
 * sparingly: under the navbar and along the footer's top edge. Rendered in
 * the site's own navy/gold pair rather than a stock pattern. */
export default function NationalOrnament({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const uid = useId().replace(/[:]/g, "");
  const gold = "#C99A2E";
  const line = variant === "dark" ? "rgba(201, 154, 46, 0.55)" : "rgba(10, 31, 68, 0.16)";

  return (
    <div className={`ornament-band ${variant === "dark" ? "dark" : ""}`} aria-hidden="true">
      <svg width="100%" height="10" preserveAspectRatio="none" viewBox="0 0 64 10">
        <defs>
          <pattern id={`girih-${uid}`} width="32" height="10" patternUnits="userSpaceOnUse">
            <path
              d="M0 5 L6 5 L9 1.5 L12 5 L16 5 L19 8.5 L22 5 L26 5 L29 1.5 L32 5"
              fill="none"
              stroke={line}
              strokeWidth="1.1"
            />
            <circle cx="9" cy="1.5" r="1.1" fill={gold} opacity="0.85" />
            <circle cx="19" cy="8.5" r="1.1" fill={gold} opacity="0.85" />
            <circle cx="29" cy="1.5" r="1.1" fill={gold} opacity="0.85" />
          </pattern>
        </defs>
        <rect width="64" height="10" fill={`url(#girih-${uid})`} />
      </svg>
    </div>
  );
}
