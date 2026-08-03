"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** AiChatWidget listens for this on `window` and opens itself — lets a
 * button anywhere on the page (e.g. the hero CTA) open the same chat
 * panel the header's own trigger opens, without lifting its open state
 * into a shared store. */
export const OPEN_AI_CHAT_EVENT = "open-ai-chat";

export default function OpenAiChatButton({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      className={className}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={() => window.dispatchEvent(new Event(OPEN_AI_CHAT_EVENT))}
    >
      {children}
    </motion.button>
  );
}
