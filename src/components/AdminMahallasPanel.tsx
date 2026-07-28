"use client";

import { useTransition } from "react";
import { adminUpdateMahallaAction } from "@/actions/mahallas";
import type { Mahalla } from "@prisma/client";

export default function AdminMahallasPanel({ mahallas }: { mahallas: Mahalla[] }) {
  const [isPending, startTransition] = useTransition();

  function save(id: string, form: HTMLFormElement) {
    const fd = new FormData(form);
    startTransition(() => adminUpdateMahallaAction(id, fd));
  }

  return (
    <div className="grid grid-2">
      {mahallas.map((m) => (
        <form
          key={m.id}
          className="card"
          onSubmit={(e) => {
            e.preventDefault();
            save(m.id, e.currentTarget);
          }}
        >
          <h4>{m.nomi}</h4>
          <div className="field">
            <label>Aholi</label>
            <input className="mini-input" style={{ width: "100%" }} type="number" name="aholi" defaultValue={m.aholi} />
          </div>
          <div className="field">
            <label>Tadbirkorlik subyektlari</label>
            <input
              className="mini-input"
              style={{ width: "100%" }}
              type="number"
              name="tadbirkorlik"
              defaultValue={m.tadbirkorlik}
            />
          </div>
          <div className="field">
            <label>Bo&apos;sh ish o&apos;rinlari</label>
            <input
              className="mini-input"
              style={{ width: "100%" }}
              type="number"
              name="vakansiya"
              defaultValue={m.vakansiya}
            />
          </div>
          <button className="btn btn-outline btn-sm" type="submit" disabled={isPending}>
            {isPending ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </form>
      ))}
    </div>
  );
}
