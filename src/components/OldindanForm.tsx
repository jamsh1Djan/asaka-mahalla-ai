"use client";

import { useState } from "react";

export default function OldindanForm() {
  const [turi, setTuri] = useState("Jismoniy shaxs");
  const [daromad, setDaromad] = useState(5_000_000);
  const [summa, setSumma] = useState(10_000_000);

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
          value={daromad}
          onChange={(e) => setDaromad(Number(e.target.value) || 0)}
        />
      </div>
      <div className="field">
        <label>Xohlagan kredit summasi (so&apos;m)</label>
        <input
          type="number"
          value={summa}
          onChange={(e) => setSumma(Number(e.target.value) || 0)}
        />
      </div>
      <hr className="soft" />
      <div className={approved ? "ok-box" : "warn-box"}>
        {approved
          ? `✅ Oldindan tasdiqlangan. Xohlagan summangiz yillik daromadingizga mos keladi. Mahalla bankiringiz bilan bog'lanib, arizani rasmiylashtirishingiz mumkin.`
          : `⚠️ Ushbu summa joriy daromadingiz uchun biroz yuqori. Kichikroq summa yoki uzunroq muddat bilan qayta urinib ko'ring.`}
      </div>
    </div>
  );
}
