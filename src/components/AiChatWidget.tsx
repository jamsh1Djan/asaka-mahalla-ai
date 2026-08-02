"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Sparkles, X, CheckCircle2, FileText, UserRound, ArrowRight } from "lucide-react";
import {
  getMahallaOptionsAction,
  matchCreditAction,
  type MahallaOption,
  type CreditMatchResult,
} from "@/actions/chat";
import type { EmploymentStatus } from "@/lib/data";

type Bubble = { from: "bot" | "me"; content: ReactNode; key: string };
type Stage =
  | "menu"
  | "credit-amount"
  | "credit-employment"
  | "credit-mahalla"
  | "credit-result"
  | "biznes"
  | "ariza-info"
  | "bankir-mahalla"
  | "bankir-result";

const AMOUNT_OPTIONS = [
  { label: "5 mln gacha", value: 5_000_000 },
  { label: "5-20 mln", value: 20_000_000 },
  { label: "20-50 mln", value: 50_000_000 },
  { label: "50 mln dan ko'p", value: 300_000_000 },
];

const EMPLOYMENT_OPTIONS: { label: string; value: EmploymentStatus }[] = [
  { label: "O'zini o'zi band qilganman", value: "self_employed" },
  { label: "Doimiy ish joyida ishlayman", value: "employed" },
  { label: "Tadbirkor/biznes egasiman", value: "business_owner" },
];

const WELCOME = "Assalomu alaykum! Kredit yoki biznes reja bo'yicha yordam beraymi? Quyidagilardan birini tanlang:";

let idSeq = 0;
function nextKey() {
  idSeq += 1;
  return `b${idSeq}`;
}

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("menu");
  const [bubbles, setBubbles] = useState<Bubble[]>([{ from: "bot", content: WELCOME, key: nextKey() }]);
  const [mahallas, setMahallas] = useState<MahallaOption[] | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [employment, setEmployment] = useState<EmploymentStatus | null>(null);
  const [pending, setPending] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !mahallas) {
      getMahallaOptionsAction().then(setMahallas);
    }
  }, [open, mahallas]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [bubbles]);

  function say(from: "bot" | "me", content: ReactNode) {
    setBubbles((b) => [...b, { from, content, key: nextKey() }]);
  }

  function reset() {
    setStage("menu");
    setBubbles([{ from: "bot", content: WELCOME, key: nextKey() }]);
    setAmount(null);
    setEmployment(null);
  }

  function chooseMenu(label: string, next: Stage, botLine: string) {
    say("me", label);
    say("bot", botLine);
    setStage(next);
  }

  function chooseAmount(opt: (typeof AMOUNT_OPTIONS)[number]) {
    say("me", opt.label);
    setAmount(opt.value);
    say("bot", "Bandlik holatingiz qanday?");
    setStage("credit-employment");
  }

  function chooseEmployment(opt: (typeof EMPLOYMENT_OPTIONS)[number]) {
    say("me", opt.label);
    setEmployment(opt.value);
    say("bot", "Qaysi mahalladansiz?");
    setStage("credit-mahalla");
  }

  async function chooseCreditMahalla(m: MahallaOption) {
    say("me", m.nomi);
    if (amount === null || employment === null) return;
    setPending(true);
    const result = await matchCreditAction(amount, employment, m.id);
    setPending(false);
    if ("error" in result) {
      say("bot", result.error);
      setStage("menu");
      return;
    }
    say("bot", <CreditActionCard result={result} />);
    setStage("credit-result");
  }

  async function chooseBankirMahalla(m: MahallaOption) {
    say("me", m.nomi);
    say(
      "bot",
      m.bankerName ? (
        <div className="ai-widget-card">
          <UserRound size={16} />
          <div>
            <div style={{ fontWeight: 800 }}>{m.bankerName}</div>
            <div className="small-muted">{m.nomi} MFY mas&apos;ul bankiri</div>
          </div>
        </div>
      ) : (
        `${m.nomi} mahallasiga hali bankir biriktirilmagan — admin tez orada tayinlaydi.`
      )
    );
    setStage("bankir-result");
  }

  return (
    <>
      <button className="btn btn-primary btn-sm hidden-mobile" onClick={() => setOpen(true)}>
        <Sparkles size={15} />
        AI bilan suhbat
      </button>

      {open && (
        <div className="ai-widget-overlay" onClick={() => setOpen(false)}>
          <div className="ai-widget-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ai-widget-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="chat-avatar">
                  <Sparkles size={15} />
                </div>
                <div>
                  <b style={{ display: "block", fontSize: 13.5 }}>Asaka AI</b>
                  <span style={{ fontSize: 11, opacity: 0.85 }}>Tugmalar orqali tez yordam</span>
                </div>
              </div>
              <button className="ai-widget-close" onClick={() => setOpen(false)} aria-label="Yopish">
                <X size={18} />
              </button>
            </div>

            <div className="ai-widget-body" ref={bodyRef}>
              {bubbles.map((b) => (
                <div key={b.key} className={`chat-row ${b.from === "me" ? "me" : ""}`}>
                  <div className="chat-bubble">{b.content}</div>
                </div>
              ))}
              {pending && (
                <div className="chat-row">
                  <div className="chat-bubble">
                    <span className="spinner" style={{ borderTopColor: "var(--red)", borderColor: "rgba(215,25,32,.25)" }} />
                  </div>
                </div>
              )}
            </div>

            <div className="ai-widget-quick-replies">
              {stage === "menu" && (
                <>
                  <button onClick={() => chooseMenu("💰 Kredit tanlash", "credit-amount", "Qancha miqdorda kredit kerak?")}>
                    💰 Kredit tanlash
                  </button>
                  <button
                    onClick={() => {
                      say("me", "💡 Biznes g'oya");
                      say(
                        "bot",
                        <span>
                          Mahallangizga mos biznes g&apos;oyalarini{" "}
                          <Link href="/biznes-reja" style={{ color: "var(--red)", fontWeight: 700 }} onClick={() => setOpen(false)}>
                            Biznes reja yordamchisi
                          </Link>{" "}
                          bo&apos;limida to&apos;liq so&apos;rovnoma orqali topib beraman.
                        </span>
                      );
                      setStage("biznes");
                    }}
                  >
                    💡 Biznes g&apos;oya
                  </button>
                  <button
                    onClick={() =>
                      chooseMenu(
                        "📋 Ariza jarayoni",
                        "ariza-info",
                        "Juda oddiy: 1) mahallangizni tanlang, 2) ariza shaklini to'ldiring (ism, telefon, kredit turi), 3) mahalla bankiri ko'rib chiqib, qo'ng'iroq yoki SMS orqali bog'lanadi. Boshqa hujjat hozircha kerak emas."
                      )
                    }
                  >
                    📋 Ariza jarayoni
                  </button>
                  <button onClick={() => chooseMenu("👤 Bankir bilan bog'lanish", "bankir-mahalla", "Qaysi mahalladansiz?")}>
                    👤 Bankir bilan bog&apos;lanish
                  </button>
                </>
              )}

              {stage === "credit-amount" &&
                AMOUNT_OPTIONS.map((o) => (
                  <button key={o.label} onClick={() => chooseAmount(o)}>
                    {o.label}
                  </button>
                ))}

              {stage === "credit-employment" &&
                EMPLOYMENT_OPTIONS.map((o) => (
                  <button key={o.value} onClick={() => chooseEmployment(o)}>
                    {o.label}
                  </button>
                ))}

              {stage === "credit-mahalla" &&
                (mahallas ?? []).map((m) => (
                  <button key={m.id} disabled={pending} onClick={() => chooseCreditMahalla(m)}>
                    {m.nomi}
                  </button>
                ))}

              {stage === "bankir-mahalla" &&
                (mahallas ?? []).map((m) => (
                  <button key={m.id} onClick={() => chooseBankirMahalla(m)}>
                    {m.nomi}
                  </button>
                ))}

              {(stage === "credit-result" || stage === "ariza-info" || stage === "biznes" || stage === "bankir-result") && (
                <button onClick={reset}>
                  <ArrowRight size={13} style={{ transform: "rotate(180deg)" }} /> Boshqa savol
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CreditActionCard({ result }: { result: CreditMatchResult }) {
  return (
    <div className="ai-widget-card ai-widget-card-full">
      <div className="ai-widget-card-row">
        <CheckCircle2 size={16} color="#2b7a43" />
        <span>
          Sizga mos: <b>{result.creditNomi}</b> ({result.creditMiqdori}, {result.creditFoiz})
        </span>
      </div>
      <div className="ai-widget-card-row">
        <FileText size={16} color="var(--navy)" />
        <span>Kerakli hujjatlar: {result.requiredDocuments.join(", ")}</span>
      </div>
      <div className="ai-widget-card-row">
        <UserRound size={16} color="var(--red)" />
        <span>
          Mas&apos;ul bankir: <b>{result.bankerName ?? "hali biriktirilmagan"}</b> — {result.mahallaNomi} MFY
        </span>
      </div>
      <Link href={`/mahallalar/${result.mahallaId}`} className="btn btn-primary btn-sm" style={{ marginTop: 10, justifyContent: "center" }}>
        Ariza berish <ArrowRight size={14} />
      </Link>
    </div>
  );
}
