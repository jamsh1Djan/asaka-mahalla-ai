"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const VARIANTS: Record<"up" | "scale", Variants> = {
  up: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1 } },
};

/** Entrance animation used across the site's card grids and hero content:
 * fade+translateY on mount for above-the-fold content, or fade+scale
 * triggered on scroll for grids further down the page. */
export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
  onView = false,
}: {
  children: ReactNode;
  variant?: "up" | "scale";
  delay?: number;
  className?: string;
  /** Animate when scrolled into view instead of immediately on mount. */
  onView?: boolean;
}) {
  const viewProps = onView
    ? { initial: "hidden" as const, whileInView: "show" as const, viewport: { once: true, margin: "-80px" } }
    : { initial: "hidden" as const, animate: "show" as const };

  return (
    <motion.div
      className={className}
      variants={VARIANTS[variant]}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: delay / 1000 }}
      {...viewProps}
    >
      {children}
    </motion.div>
  );
}
