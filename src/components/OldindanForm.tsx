"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function OldindanForm() {
  const [turi, setTuri] = useState("Jismoniy shaxs");
  const [daromadStr, setDaromadStr] = useState("5000000");
  const [summaStr, setSummaStr] = useState("10000000");

  const daromad = Number(daromadStr) || 0;
  const summa = Number(summaStr) || 0;
  const nisbat = summa / (daromad * 12 || 1);
  const approved = nisbat <= 3;

  return (
    <div className="card">
      <div className="field">
        <label>Shaxs turi</label>
        <select value={turi} onChange={(e) => setTuri(e.target.value)}>
          <option>Jismoniy shaxs</option>
          <option>Yuridik shaxs</option>
        </select>
      </div>
      <div className="field">
        <label>Oylik daromadingiz (so&apos;m)</label>
        <input
          type="number"
          value={daromadStr}
          onChange={(e) => setDaromadStr(e.target.value)}
        />
      </div>
      <div className="field">
        <label>Xohlagan kredit summasi (so&apos;m)</label>
        <input
          type="number"
          value={summaStr}
          onChange={(e) => setSummaStr(e.target.value)}
        />
      </div>
      <hr className="soft" />
      <div className={approved ? "ok-box" : "warn-box"} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        {approved ? <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} /> : <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />}
        <span>
          {approved
            ? `Oldindan tasdiqlangan. Xohlagan summangiz yillik daromadingizga mos keladi. Mahalla bankiringiz bilan bog'lanib, arizani rasmiylashtirishingiz mumkin.`
            : `Ushbu summa joriy daromadingiz uchun biroz yuqori. Kichikroq summa yoki uzunroq muddat bilan qayta urinib ko'ring.`}
        </span>
      </div>
    </div>
  );
}
