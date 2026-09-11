"use client";

import { useState, useTransition } from "react";
import { Bot, ChevronDown, ChevronUp } from "lucide-react";
import { getBusinessIdeasAction, type BusinessIdea } from "@/actions/ai";
import { SOHALAR } from "@/lib/businessIdeas";
import BusinessPlanDetail from "@/components/BusinessPlanDetail";

const BUDGETS = ["5 mln gacha", "5-20 mln", "20-50 mln", "50 mln dan ko'p"];
const TAJRIBALAR = ["Yangi boshlovchi", "Tajribam bor"];
const AVTOMATIK = "AI o'zi tanlasin";
const SOHA_OPTIONS = [AVTOMATIK, ...SOHALAR];

export default function AiPlanner({ mahallaId, drayver, nomi }: { mahallaId: string; drayver: string; nomi: string }) {
  const [budget, setBudget] = useState(BUDGETS[1]);
  const [tajriba, setTajriba] = useState(TAJRIBALAR[0]);
  const [soha, setSoha] = useState(AVTOMATIK);
  const [ideas, setIdeas] = useState<BusinessIdea[] | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run() {
    setError(null);
    startTransition(async () => {
      const result = await getBusinessIdeasAction(
        mahallaId,
        budget,
        tajriba,
        soha === AVTOMATIK ? "avtomatik" : soha
      );
      if ("error" in result) {
        setError(result.error);
        setIdeas(null);
      } else {
        setIdeas(result.ideas);
        setExpanded(null);
      }
    });
  }

  return (
    <div className="ai-box">
      <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}><Bot size={19} /> AI biznes-reja tavsiyachisi</h3>
      <p>
        {nomi} mahallasining ixtisoslashuvi ({drayver}) asosida, sizga mos biznes g&apos;oyalarini
        va ularga mos kredit turini taklif qilamiz.
      </p>
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
        <label>Qaysi sohaga qiziqasiz?</label>
        <div className="choice-row">
          {SOHA_OPTIONS.map((s) => (
            <button key={s} type="button" className={`chip ${soha === s ? "active" : ""}`} onClick={() => setSoha(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <button className="btn btn-gold" onClick={run} disabled={isPending}>
        {isPending ? (
          <>
            <span className="spinner" /> Tahlil qilinmoqda...
          </>
        ) : (
          "AI tavsiyasini olish"
        )}
      </button>
      <div>
        {error && <p style={{ color: "#ffb4b4", marginTop: 14 }}>{error}</p>}
        {ideas?.map((idea, i) => (
          <div key={i} className="idea-card">
            <h5>{idea.nomi}</h5>
            <div style={{ fontSize: 13, color: "var(--ink)" }}>{idea.tavsif}</div>
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
            <button
              type="button"
              className="btn btn-outline btn-sm bp-toggle"
              onClick={() => setExpanded((cur) => (cur === i ? null : i))}
            >
              {expanded === i ? (
                <>
                  <ChevronUp size={14} /> To&apos;liq rejani yopish
                </>
              ) : (
                <>
                  <ChevronDown size={14} /> To&apos;liq biznes-rejani ko&apos;rish
                </>
              )}
            </button>
            {expanded === i && <BusinessPlanDetail idea={idea} />}
          </div>
        ))}
      </div>
    </div>
  );
}
