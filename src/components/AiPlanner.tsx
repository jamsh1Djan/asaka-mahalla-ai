"use client";

import { useState, useTransition } from "react";
import { getBusinessIdeasAction, type BusinessIdea } from "@/actions/ai";

const BUDGETS = ["5 mln gacha", "5-20 mln", "20-50 mln", "50 mln dan ko'p"];
const TAJRIBALAR = ["Yangi boshlovchi", "Tajribam bor"];

export default function AiPlanner({ mahallaId, drayver, nomi }: { mahallaId: string; drayver: string; nomi: string }) {
  const [budget, setBudget] = useState(BUDGETS[1]);
  const [tajriba, setTajriba] = useState(TAJRIBALAR[0]);
  const [ideas, setIdeas] = useState<BusinessIdea[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run() {
    setError(null);
    startTransition(async () => {
      const result = await getBusinessIdeasAction(mahallaId, budget, tajriba);
      if ("error" in result) {
        setError(result.error);
        setIdeas(null);
      } else {
        setIdeas(result.ideas);
      }
    });
  }

  return (
    <div className="ai-box">
      <h3>🤖 AI biznes-reja tavsiyachisi</h3>
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
          </div>
        ))}
      </div>
    </div>
  );
}
