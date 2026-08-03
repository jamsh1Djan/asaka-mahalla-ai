"use client";

import type { ReactNode } from "react";
import { OPEN_AI_CHAT_EVENT } from "@/components/OpenAiChatButton";

/** Same open-the-chat-widget trigger as OpenAiChatButton, but as a plain
 * clickable div — for the hero's chat-preview mockup card, which already
 * has its own hover treatment in CSS (.chatbox-link) rather than the
 * motion.button lift used elsewhere. */
export default function OpenAiChatCard({ className, children }: { className?: string; children: ReactNode }) {
  function open() {
    window.dispatchEvent(new Event(OPEN_AI_CHAT_EVENT));
  }
  return (
    <div
      className={className}
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
    >
      {children}
    </div>
  );
}
