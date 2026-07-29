"use client";

import { useState } from "react";
import Link from "next/link";
import { CREDIT_PRODUCTS } from "@/lib/data";
import { fmt } from "@/lib/format";

export default function Calculator() {
  const [productIdx, setProductIdx] = useState(0);
  const [amount, setAmount] = useState(10_000_000);
  const [amountStr, setAmountStr] = useState("10000000");
  const [months, setMonths] = useState(12);

  const p = CREDIT_PRODUCTS[productIdx];
  const rateMatches = p.foiz.match(/\d+/g);
  const rate = rateMatches ? Number(rateMatches[rateMatches.length - 1]) : 25;
  const monthlyRate = rate / 100 / 12;
  const payment =
    monthlyRate > 0
      ? (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
      : amount / months;

  return (
    <div className="card">
      <div className="field">
        <label>Kredit turi</label>
        <select value={productIdx} onChange={(e) => setProductIdx(Number(e.target.value))}>
          {CREDIT_PRODUCTS.map((c, i) => (
            <option key={c.id} value={i}>
              {c.nomi} ({c.foiz})
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>
          Summa: <b>{fmt(amount)} so&apos;m</b>
        </label>
        <input
          type="range"
          min={1_000_000}
          max={300_000_000}
          step={500_000}
          value={amount}
          onChange={(e) => {
            setAmount(Number(e.target.value));
            setAmountStr(e.target.value);
          }}
        />
        <input
          type="number"
          className="mini-input"
          style={{ width: "100%", marginTop: 8 }}
          value={amountStr}
          onChange={(e) => {
            setAmountStr(e.target.value);
            setAmount(Number(e.target.value) || 0);
          }}
        />
      </div>
      <div className="field">
        <label>
          Muddati: <b>{months} oy</b>
        </label>
        <input
          type="range"
          min={3}
          max={84}
          step={1}
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
        />
      </div>
      <hr className="soft" />
      <div className="pill-row" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
        <div className="pill">
          <span>Oylik to&apos;lov (taxminiy)</span>
          <b>{fmt(Math.round(payment))} so&apos;m</b>
        </div>
        <div className="pill">
          <span>Yillik foiz stavkasi</span>
          <b>{rate}%</b>
        </div>
      </div>
      <Link
        href="/oldindan"
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center", marginTop: 10 }}
      >
        Oldindan tasdiqni tekshirish →
      </Link>
    </div>
  );
}
