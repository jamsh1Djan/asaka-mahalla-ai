"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bot, ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { getBusinessIdeasAction, type BusinessIdea } from "@/actions/ai";
import { SOHALAR } from "@/lib/businessIdeas";
import type { Mahalla } from "@prisma/client";

const BUDGETS = ["5 mln gacha", "5-20 mln", "20-50 mln", "50 mln dan ko'p"];
const TAJRIBALAR = ["Yangi boshlovchi", "Tajribam bor"];
const JAMOA_HAJMLARI = ["Yolg'iz o'zim", "2-3 kishi", "4-10 kishi", "10 dan ko'p"];
const AVTOMATIK = "AI o'zi tanlasin";
const SOHA_OPTIONS = [AVTOMATIK, ...SOHALAR];

type Step = "mahalla" | "soruvnoma" | "natija";

export default function BusinessPlanWizard({ mahallas }: { mahallas: Mahalla[] }) {
  const [step, setStep] = useState<Step>("mahalla");
  const [mahalla, setMahalla] = useState<Mahalla | null>(null);
  const [soha, setSoha] = useState(AVTOMATIK);
  const [budget, setBudget] = useState(BUDGETS[1]);
  const [tajriba, setTajriba] = useState(TAJRIBALAR[0]);
  const [jamoaHajmi, setJamoaHajmi] = useState(JAMOA_HAJMLARI[0]);
  const [ideas, setIdeas] = useState<BusinessIdea[] | null>(null);
  const [matched, setMatched] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Each step swaps in content of a very different height. Without this, a
  // user who scrolled down to reach a mahalla card further down the grid
  // stays scrolled to that position after the step changes — the new,
  // shorter content's top then sits behind the sticky header instead of
  // in view.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  function chooseMahalla(m: Mahalla) {
    setMahalla(m);
    setStep("soruvnoma");
  }

  function run() {
    if (!mahalla) return;
    setError(null);
    startTransition(async () => {
      const result = await getBusinessIdeasAction(
        mahalla.id,
        budget,
        tajriba,
        soha === AVTOMATIK ? "avtomatik" : soha,
        jamoaHajmi
      );
      if ("error" in result) {
        setError(result.error);
      } else {
        setIdeas(result.ideas);
        setMatched(result.matched);
        setVisibleCount(3);
        setStep("natija");
      }
    });
  }

  function restart() {
    setStep("mahalla");
    setMahalla(null);
    setIdeas(null);
    setError(null);
  }

  return (
    <div>
      <div className="bp-steps">
        <span className={step === "mahalla" ? "active" : mahalla ? "done" : ""}>1. Mahalla</span>
        <span className={step === "soruvnoma" ? "active" : ideas ? "done" : ""}>2. So&apos;rovnoma</span>
        <span className={step === "natija" ? "active" : ""}>3. Tavsiya</span>
      </div>

      {step === "mahalla" && (
        <div className="grid grid-3">
          {mahallas.map((m) => (
            <button key={m.id} type="button" className="card bp-mahalla-card" onClick={() => chooseMahalla(m)}>
              <h4 style={{ margin: "0 0 6px" }}>{m.nomi} MFY</h4>
              <p className="small-muted" style={{ margin: 0 }}>{m.drayver}</p>
            </button>
          ))}
        </div>
      )}

      {step === "soruvnoma" && mahalla && (
        <div className="ai-box">
          <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bot size={19} /> <span>{`${mahalla.nomi} MFY uchun so'rovnoma`}</span>
          </h3>
          <p>
            {mahalla.nomi} mahallasining ixtisoslashuvi ({mahalla.drayver}) asosida, sizga mos
            biznes g&apos;oyalarini va ularga mos kredit turini taklif qilamiz.
          </p>
          <div className="field">
            <label>Qaysi sohaga qiziqasiz?</label>
            <div className="choice-row">
              {SOHA_OPTIONS.map((s) => (
                <button key={s} type="button" className={`chip ${soha === s ? "active" : ""}`} onClick={() => setSoha(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Boshlang&apos;ich byudjetingiz</label>
            <div className="choice-row">
              {BUDGETS.map((b) => (
                <button key={b} type="button" className={`chip ${budget === b ? "active" : ""}`} onClick={() => setBudget(b)}>
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Tajribangiz</label>
            <div className="choice-row">
              {TAJRIBALAR.map((t) => (
                <button key={t} type="button" className={`chip ${tajriba === t ? "active" : ""}`} onClick={() => setTajriba(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Necha kishi bilan ishlashni rejalashtiryapsiz?</label>
            <div className="choice-row">
              {JAMOA_HAJMLARI.map((j) => (
                <button key={j} type="button" className={`chip ${jamoaHajmi === j ? "active" : ""}`} onClick={() => setJamoaHajmi(j)}>
                  {j}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn"
              style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}
              onClick={() => setStep("mahalla")}
            >
              <ArrowLeft size={15} /> Orqaga
            </button>
            <button className="btn btn-gold" onClick={run} disabled={isPending}>
              {isPending ? (
                <>
                  <span className="spinner" /> Tahlil qilinmoqda...
                </>
              ) : (
                <>
                  <Sparkles size={15} /> AI tavsiyasini olish
                </>
              )}
            </button>
          </div>
          {error && <p style={{ color: "#ffb4b4", marginTop: 14 }}>{error}</p>}
        </div>
      )}

      {step === "natija" && mahalla && ideas && (
        <div>
          <div className={matched ? "ok-box" : "warn-box"} style={{ marginBottom: 18, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              {matched
                ? `${mahalla.nomi} mahallasining ixtisoslashuvi (${mahalla.drayver}) asosida, mahallangizga maxsus tavsiya etilgan biznes-g'oyalar.`
                : `Javoblaringiz mahallangizning ixtisoslashgan yo'nalishiga to'g'ridan-to'g'ri mos kelmadi — quyida umumiy, kichik biznes uchun standart tavsiyalar keltirilgan.`}
            </span>
          </div>
          <div className="grid grid-3">
            {ideas.slice(0, visibleCount).map((idea, i) => (
              <div key={i} className="card">
                <h5 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800, color: "var(--navy)" }}>{idea.nomi}</h5>
                <p style={{ fontSize: 13, marginBottom: 10 }}>{idea.tavsif}</p>
                <div className="credit-rows">
                  <div className="row">
                    <span>Boshlang&apos;ich xarajat</span>
                    <b>{idea.boshlangich_xarajat}</b>
                  </div>
                  <div className="row">
                    <span>Taxminiy oylik daromad</span>
                    <b>{idea.kutilayotgan_oylik_daromad}</b>
                  </div>
                  <div className="row">
                    <span>Mos kredit turi</span>
                    <b>{idea.mos_kredit}</b>
                  </div>
                  <div className="row">
                    <span>Taxminiy oylik to&apos;lov</span>
                    <b>{idea.oylik_tolov}</b>
                  </div>
                  <div className="row">
                    <span>Qarzdan qutulish muddati</span>
                    <b>{idea.qaytarish_muddati}</b>
                  </div>
                </div>
                <Link href={`/mahallalar/${mahalla.id}`} className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>
                  Batafsil <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-outline" onClick={restart}>
              <ArrowLeft size={15} /> Boshqa mahalla / qaytadan urinish
            </button>
            {visibleCount < ideas.length && (
              <button type="button" className="btn btn-primary" onClick={() => setVisibleCount((c) => c + 3)}>
                Yana ko&apos;rsat ({ideas.length - visibleCount} ta)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
