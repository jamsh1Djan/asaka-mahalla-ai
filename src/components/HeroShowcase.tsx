"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  MoreHorizontal,
  Calculator,
  FileText,
  BarChart3,
  Home,
  UserRound,
  ArrowRight,
} from "lucide-react";
import { OPEN_AI_CHAT_EVENT } from "@/components/OpenAiChatButton";

// Real product, not a made-up example — "Biznesga birinchi qadam 2.0":
// 17 mln so'mgacha, 36 oygacha, 27% (see CREDIT_PRODUCTS in lib/data.ts).
// The preview card below must never show a figure that product doesn't
// actually offer.
const PREVIEW_CREDIT = { nomi: "Biznesga birinchi qadam 2.0", amount: "17 000 000 so'm", term: "36 oy", rate: "27%" };

const MINI_CARDS = [
  // .hero-showcase only ever renders at one deterministic width in the
  // range where this absolute layout is even active: exactly 547.2px (see
  // the comment on .hero-showcase in globals.css for why). Against that
  // fixed width, with the 320px chat card centered, its edges sit at
  // 113.6px from each side. Every offset below is sized so a 188px-wide
  // card clears that edge with ~24px to spare — computed against the
  // container, not eyeballed at one viewport width, which is exactly what
  // let these slide under the chat card before.
  {
    key: "kalkulyator",
    href: "/kalkulyator",
    icon: Calculator,
    tone: "rose",
    title: "Kredit kalkulyatori",
    sub: "To'lovlarni hisoblang",
    pos: { top: "2%", left: "-18%" },
  },
  {
    key: "ariza",
    href: "/mahallalar",
    icon: FileText,
    tone: "blue",
    title: "Ariza yuborish",
    sub: "Online ariza to'ldiring",
    pos: { top: "40%", left: "-18%" },
  },
  {
    key: "biznes-reja",
    href: "/biznes-reja",
    icon: BarChart3,
    tone: "violet",
    title: "Biznes reja",
    sub: "AI bilan reja yarating",
    pos: { top: "0%", right: "-18%" },
  },
  {
    key: "imtiyozlar",
    href: "/mahallalar",
    icon: Home,
    tone: "amber",
    title: "Mahalla imtiyozlari",
    sub: "Imtiyoz va dasturlar",
    pos: { top: "42%", right: "-18%" },
  },
] as const;

const TONE_BG: Record<string, string> = {
  rose: "rgba(215, 25, 32, 0.1)",
  blue: "rgba(37, 99, 235, 0.1)",
  violet: "rgba(124, 58, 237, 0.1)",
  amber: "rgba(217, 119, 6, 0.12)",
  green: "rgba(22, 163, 74, 0.1)",
};
const TONE_FG: Record<string, string> = {
  rose: "var(--red)",
  blue: "#2563eb",
  violet: "#7c3aed",
  amber: "#d97706",
  green: "#16a34a",
};

function openAiChat() {
  window.dispatchEvent(new Event(OPEN_AI_CHAT_EVENT));
}

export default function HeroShowcase() {
  return (
    <div className="hero-showcase">
      <div className="hero-showcase-bg" aria-hidden="true" />

      <svg className="hero-connectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M16,14 C28,22 38,32 47,40" />
        <path d="M12,46 C24,46 36,45 46,45" />
        <path d="M84,12 C72,20 62,30 53,38" />
        <path d="M90,48 C77,48 65,46 54,46" />
        <path d="M84,86 C72,76 62,66 54,58" />
      </svg>

      <motion.div
        className="hero-chat-card"
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <div className="hero-chat-head">
          <div className="hero-chat-avatar">
            <Sparkles size={16} />
          </div>
          <div>
            <b>Asaka AI</b>
            <span>
              <span className="hero-chat-dot" /> Onlayn
            </span>
          </div>
          <MoreHorizontal size={16} className="hero-chat-more" />
        </div>

        <p className="hero-chat-greeting">
          Salom! 👋
          <br />
          Sizga qanday yordam bera olaman?
        </p>

        <div className="hero-reco-card">
          <div className="hero-reco-head">
            <span>Kredit tavsiyasi</span>
            <span className="hero-reco-badge">Tavsiya etildi</span>
          </div>
          <span className="hero-reco-label">Maksimal summa</span>
          <div className="hero-reco-amount">{PREVIEW_CREDIT.amount}</div>
          <div className="hero-reco-pills">
            <span>Muddat: {PREVIEW_CREDIT.term}</span>
            <span>{PREVIEW_CREDIT.rate} stavka</span>
          </div>
          <Link href="/kreditlar" className="btn btn-primary btn-sm hero-reco-btn">
            Batafsil ko&apos;rish <ArrowRight size={14} />
          </Link>
        </div>

        <button type="button" className="hero-chat-hint" onClick={openAiChat}>
          <Sparkles size={14} />
          <span>
            <b>Sizga mos dasturni topamiz</b>
            <span>AI sizning ma&apos;lumotlaringizni tahlil qiladi</span>
          </span>
        </button>
      </motion.div>

      <div className="hero-mini-cards-grid">
        {MINI_CARDS.map((c, i) => (
          <motion.div
            key={c.key}
            className={`hero-mini-card hero-mini-${c.key}`}
            style={c.pos}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
          >
            <Link href={c.href} className="hero-mini-card-link">
              <span className="hero-mini-ic" style={{ background: TONE_BG[c.tone], color: TONE_FG[c.tone] }}>
                <c.icon size={16} />
              </span>
              <span className="hero-mini-text">
                <b>{c.title}</b>
                <span>{c.sub}</span>
              </span>
              <span className="hero-mini-arrow">
                <ArrowRight size={12} />
              </span>
            </Link>
          </motion.div>
        ))}

        <motion.button
          type="button"
          className="hero-mini-card hero-mini-bankir"
          onClick={openAiChat}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.47 }}
        >
          <span className="hero-mini-ic" style={{ background: TONE_BG.green, color: TONE_FG.green }}>
            <UserRound size={16} />
          </span>
          <span className="hero-mini-text">
            <b>Bankir bilan bog&apos;lanish</b>
            <span>Maslahat oling</span>
          </span>
          <span className="hero-mini-arrow">
            <ArrowRight size={12} />
          </span>
        </motion.button>
      </div>
    </div>
  );
}
