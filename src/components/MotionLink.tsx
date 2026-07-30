"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ComponentProps } from "react";

// Framer Motion's DOM event types and next/link's anchor props conflict on
// onDrag/onDragStart/onDragEnd — a known incompatibility when animating a
// wrapped <Link>, harmless here since we never pass those handlers through.
const MotionNextLink = motion.create(Link as unknown as React.ComponentType<Record<string, unknown>>);

/** Next.js <Link> with the hero CTA's lift-on-hover interaction. */
export default function MotionLink(props: ComponentProps<typeof Link>) {
  return (
    <MotionNextLink
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...props}
    />
  );
}
