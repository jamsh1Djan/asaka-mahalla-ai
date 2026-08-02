"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Wallet } from "lucide-react";
import { CREDIT_PRODUCTS } from "@/lib/data";
import { fmt } from "@/lib/format";

// Only the 5 so'm-denominated products have real min/max slider bounds —
// the export product's terms are $-denominated (see data.ts), so it's
// excluded rather than showing a nonsensical multi-billion-so'm slider.
const CALC_PRODUCTS = CREDIT_PRODUCTS.filter((p) => p.calc);

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

type ScheduleRow = { month: number; payment: number; interest: number; principal: number; balance: number };

export default function Calculator() {
  const [productIdx, setProductIdx] = useState(0);
  const product = CALC_PRODUCTS[productIdx];
  const bounds = product.calc!;

  const [amount, setAmount] = useState(product.miqdoriSom);
  const [months, setMonths] = useState(bounds.muddatOyMax);

  // Switching products resets amount/months to the new product's own max —
  // its old values could be out of range (or misleadingly mid-range) for a
  // completely different loan ceiling.
  useEffect(() => {
    setAmount(product.miqdoriSom);
    setMonths(bounds.muddatOyMax);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIdx]);

  // Larger loans within a product's own quoted range get the lower end of
  // its rate band — real banking practice, and still fully inside the
  // product's own stated range, never outside it.
  const amountFrac =
    bounds.foizMin === bounds.foizMax
      ? 0
      : clamp((amount - bounds.minMiqdoriSom) / (product.miqdoriSom - bounds.minMiqdoriSom), 0, 1);
  const rate = bounds.foizMax - (bounds.foizMax - bounds.foizMin) * amountFrac;
  const monthlyRate = rate / 100 / 12;

  const payment =
    monthlyRate > 0
      ? (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
      : amount / months;

  const totalPayment = payment * months;
  const totalInterest = totalPayment - amount;

  const schedule = useMemo<ScheduleRow[]>(() => {
    const rows: ScheduleRow[] = [];
    let balance = amount;
    for (let m = 1; m <= months; m++) {
      const interest = balance * monthlyRate;
      const principal = Math.min(balance, payment - interest);
      balance = Math.max(0, balance - principal);
      rows.push({ month: m, payment, interest, principal, balance });
    }
    return rows;
  }, [amount, months, monthlyRate, payment]);

  const principalPct = totalPayment > 0 ? (amount / totalPayment) * 100 : 100;

  // --- Affordability check ---
  const [incomeStr, setIncomeStr] = useState("");
  const [expensesStr, setExpensesStr] = useState("");
  const [plannedStr, setPlannedStr] = useState("");
  const [plannedTouched, setPlannedTouched] = useState(false);

  // Auto-fills from the calculated monthly payment above until the visitor
  // manually edits it — after that their own number is left alone even as
  // amount/months keep changing.
  useEffect(() => {
    if (!plannedTouched) setPlannedStr(String(Math.round(payment)));
  }, [payment, plannedTouched]);

  const income = Number(incomeStr) || 0;
  const expenses = Number(expensesStr) || 0;
  const planned = Number(plannedStr) || 0;
  const freeFunds = income - expenses;
  const hasBudgetInput = incomeStr.trim() !== "" || expensesStr.trim() !== "";
  const loadPct = freeFunds > 0 ? (planned / freeFunds) * 100 : planned > 0 ? Infinity : 0;
  const tier: "ok" | "warn" | "danger" = loadPct <= 30 ? "ok" : loadPct <= 50 ? "warn" : "danger";
  const tierLabel = { ok: "Qulay", warn: "Chegarada", danger: "Xavfli" }[tier];
  const tierMessage = {
    ok: "To'lov qulay — erkin mablag'ingiz yetarli.",
    warn: "To'lov mumkin, lekin ehtiyot bo'ling — kutilmagan xarajatlar bo'lishi mumkin.",
    danger:
      freeFunds <= 0
        ? "Erkin mablag'ingiz yo'q yoki manfiy — daromad va xarajatlarni qayta ko'rib chiqing."
        : "Yuklama yuqori — to'lov qiyinchilik tug'dirishi mumkin, kredit miqdorini kamaytirishni ko'rib chiqing.",
  }[tier];

  return (
    <div className="calc-grid">
      <div className="calc-input-card card">
        <div className="field">
          <label>Kredit mahsuloti</label>
          <select
            value={productIdx}
            onChange={(e) => {
              setProductIdx(Number(e.target.value));
              setPlannedTouched(false);
            }}
          >
            {CALC_PRODUCTS.map((p, i) => (
              <option key={p.id} value={i}>
                {p.nomi} — {p.foiz}
              </option>
            ))}
          </select>
        </div>

        <div className="calc-slider-field">
          <div className="calc-slider-head">
            <label>Miqdor</label>
            <b>{fmt(amount)} so&apos;m</b>
          </div>
          <input
            type="range"
            className="calc-slider"
            min={bounds.minMiqdoriSom}
            max={product.miqdoriSom}
            step={Math.max(100_000, Math.round((product.miqdoriSom - bounds.minMiqdoriSom) / 200))}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <div className="calc-slider-range">
            <span>{fmt(bounds.minMiqdoriSom)} so&apos;m</span>
            <span>{fmt(product.miqdoriSom)} so&apos;mgacha</span>
          </div>
        </div>

        <div className="calc-slider-field">
          <div className="calc-slider-head">
            <label>Muddat</label>
            <b>{months} oy</b>
          </div>
          <input
            type="range"
            className="calc-slider"
            min={bounds.muddatOyMin}
            max={bounds.muddatOyMax}
            step={1}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
          />
          <div className="calc-slider-range">
            <span>{bounds.muddatOyMin} oy</span>
            <span>{bounds.muddatOyMax} oy</span>
          </div>
        </div>

        <div className="calc-rate-row">
          <span>Yillik foiz stavkasi</span>
          <b>{rate.toFixed(rate % 1 === 0 ? 0 : 1)}%</b>
        </div>
      </div>

      <div className="calc-result-card">
        <span className="calc-result-label">Oylik to&apos;lov</span>
        <div className="calc-result-amount">{fmt(payment)} so&apos;m</div>
        <div className="calc-result-stats">
          <div>
            <span>Umumiy foiz</span>
            <b>{fmt(totalInterest)} so&apos;m</b>
          </div>
          <div>
            <span>Umumiy to&apos;lov</span>
            <b>{fmt(totalPayment)} so&apos;m</b>
          </div>
        </div>

        <div className="calc-donut-wrap">
          <div
            className="calc-donut"
            style={{
              background: `conic-gradient(var(--red) 0% ${principalPct}%, rgba(215,25,32,0.22) ${principalPct}% 100%)`,
            }}
          >
            <div className="calc-donut-hole">
              <span>{Math.round(principalPct)}%</span>
              <em>asosiy qarz</em>
            </div>
          </div>
          <div className="calc-donut-legend">
            <div>
              <i style={{ background: "var(--red)" }} /> Asosiy qarz
            </div>
            <div>
              <i style={{ background: "rgba(215,25,32,0.22)" }} /> Foiz
            </div>
          </div>
        </div>

        <Link href="/mahallalar" className="btn btn-primary calc-cta">
          Shu shartlar bilan ariza berish <ArrowRight size={16} />
        </Link>
      </div>

      <div className="calc-schedule-card card">
        <div className="calc-schedule-head">
          <h4>To&apos;lovlar jadvali</h4>
          <span className="small-muted">{months} oylik amortizatsiya jadvali</span>
        </div>
        <div className="calc-schedule-scroll">
          <table className="table calc-schedule-table">
            <thead>
              <tr>
                <th>Oy</th>
                <th>To&apos;lov</th>
                <th>Foiz</th>
                <th>Asosiy qarz</th>
                <th>Qoldiq</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.month}>
                  <td>{row.month}</td>
                  <td>{fmt(row.payment)} so&apos;m</td>
                  <td>{fmt(row.interest)} so&apos;m</td>
                  <td>{fmt(row.principal)} so&apos;m</td>
                  <td>{fmt(row.balance)} so&apos;m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="calc-afford-section">
        <div className="section-head" style={{ marginBottom: 20 }}>
          <div className="section-eyebrow">To&apos;lov qulayligi</div>
          <h2 className="section-title">Byudjetingiz uchun mos keladimi?</h2>
          <p className="section-desc">
            Oylik daromad va xarajatlaringizni kiriting — kredit sizga qulay, chegarada yoki xavfli
            ekanini ko&apos;rsatamiz.
          </p>
        </div>
      </div>

      <div className="calc-afford-card card">
        <div className="calc-schedule-head">
          <h4>
            <Wallet size={17} style={{ verticalAlign: -3, marginRight: 6 }} />
            To&apos;lov qulayligini tekshirish
          </h4>
          <span className="small-muted">
            Oylik daromad va xarajatlaringizni kiriting — sizga rejalashtirilgan to&apos;lov qulay
            yoki og&apos;irligini ko&apos;rsatamiz
          </span>
        </div>
        <div className="calc-afford-fields">
          <div className="field">
            <label>Oylik daromad</label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={incomeStr}
              onChange={(e) => setIncomeStr(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Oylik xarajatlar</label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={expensesStr}
              onChange={(e) => setExpensesStr(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Rejalashtirilgan to&apos;lov</label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={plannedStr}
              onChange={(e) => {
                setPlannedStr(e.target.value);
                setPlannedTouched(true);
              }}
            />
          </div>
        </div>

        {hasBudgetInput && (
          <div className={`calc-afford-result tier-${tier}`}>
            <div className="calc-afford-result-head">
              <div>
                <TrendingUp size={15} />
                <b>{tierLabel}</b>
              </div>
              <span>{Number.isFinite(loadPct) ? `${Math.round(loadPct)}%` : "100%+"} yuklama</span>
            </div>
            <div className="calc-afford-bar">
              <div className="calc-afford-bar-fill" style={{ width: `${clamp(loadPct, 0, 100)}%` }} />
            </div>
            <p>{tierMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
