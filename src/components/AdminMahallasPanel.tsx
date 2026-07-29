"use client";

import { Fragment, useActionState, useEffect, useState, useTransition } from "react";
import {
  createMahallaAction,
  deleteMahallaAction,
  toggleMahallaStatusAction,
  updateMahallaStatsAction,
  type CreateMahallaState,
  type MahallaEditState,
} from "@/actions/mahallas";
import { fmt, fmtDate } from "@/lib/format";
import type { Banker, Mahalla } from "@prisma/client";

type BankerWithMahallas = Banker & { mahallalar: { mahallaId: string }[] };

export default function AdminMahallasPanel({
  mahallas,
  bankers,
}: {
  mahallas: Mahalla[];
  bankers: BankerWithMahallas[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();

  function bankerNamesFor(mahallaId: string) {
    const names = bankers.filter((b) => b.mahallalar.some((m) => m.mahallaId === mahallaId)).map((b) => b.ism);
    return names.length ? names.join(", ") : "—";
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h4 style={{ margin: 0 }}>Mahallalar ro&apos;yxati</h4>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? "Bekor qilish" : "+ Yangi mahalla"}
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 18 }}>
          <CreateMahallaForm bankers={bankers} onDone={() => setShowAdd(false)} />
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Mahalla nomi</th>
              <th>Mas&apos;ul bankir</th>
              <th>Aholi soni</th>
              <th>Oxirgi yangilangan</th>
              <th>Status</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {mahallas.map((m) => (
              <Fragment key={m.id}>
                <tr>
                  <td>{m.nomi}</td>
                  <td className="small-muted">{bankerNamesFor(m.id)}</td>
                  <td>{fmt(m.aholi)}</td>
                  <td className="small-muted">{fmtDate(m.updatedAt)}</td>
                  <td>
                    <span className={`status-badge ${m.status === "FAOL" ? "status-bog" : "status-yangi"}`}>
                      {m.status === "FAOL" ? "Faol" : "Faol emas"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                    >
                      Tahrirlash
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(() =>
                          toggleMahallaStatusAction(m.id, m.status === "FAOL" ? "FAOL_EMAS" : "FAOL")
                        )
                      }
                    >
                      {m.status === "FAOL" ? "Faol emasga o'tkazish" : "Faollashtirish"}
                    </button>
                    {!m.isSeed && (
                      <button
                        className="btn btn-outline btn-sm"
                        disabled={isPending}
                        onClick={() => {
                          if (!confirm(`"${m.nomi}" mahallasini o'chirishni tasdiqlaysizmi?`)) return;
                          startTransition(() => deleteMahallaAction(m.id));
                        }}
                      >
                        O&apos;chirish
                      </button>
                    )}
                  </td>
                </tr>
                {expanded === m.id && (
                  <tr>
                    <td colSpan={6}>
                      <MahallaEditRow mahalla={m} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MahallaEditRow({ mahalla }: { mahalla: Mahalla }) {
  const action = updateMahallaStatsAction.bind(null, mahalla.id);
  const [state, formAction, pending] = useActionState<MahallaEditState, FormData>(action, null);

  return (
    <form action={formAction} style={{ padding: "12px 4px" }}>
      <div className="grid grid-2">
        <div className="field">
          <label>Aholi soni</label>
          <input type="number" name="aholi" defaultValue={mahalla.aholi} />
        </div>
        <div className="field">
          <label>Bo&apos;sh ish o&apos;rinlari</label>
          <input type="number" name="vakansiya" defaultValue={mahalla.vakansiya} />
        </div>
        <div className="field">
          <label>Jami tadbirkorlik subyektlari</label>
          <input type="number" name="tadbirkorlik" defaultValue={mahalla.tadbirkorlik} />
        </div>
        <div className="field">
          <label>YATT soni</label>
          <input type="number" name="yatt" defaultValue={mahalla.yatt} />
        </div>
        <div className="field">
          <label>MChJ soni</label>
          <input type="number" name="mchj" defaultValue={mahalla.mchj} />
        </div>
        <div className="field">
          <label>Manzil</label>
          <input name="manzil" defaultValue={mahalla.manzil} />
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>Ixtisoslashuv (drayver)</label>
          <input name="drayver" defaultValue={mahalla.drayver} />
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>Tadbirkorlik joylari (vergul bilan ajrating)</label>
          <input name="faoliyatTurlari" defaultValue={mahalla.faoliyatTurlari} />
        </div>
      </div>
      {state?.error && <div className="err">{state.error}</div>}
      {state?.success && <p className="small-muted">Saqlandi.</p>}
      <button className="btn btn-primary btn-sm" type="submit" disabled={pending}>
        {pending ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
}

function CreateMahallaForm({
  bankers,
  onDone,
}: {
  bankers: Banker[];
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<CreateMahallaState, FormData>(
    createMahallaAction,
    null
  );

  useEffect(() => {
    if (state?.success) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction}>
      <div className="grid grid-2">
        <div className="field">
          <label>Mahalla nomi</label>
          <input name="nomi" required />
        </div>
        <div className="field">
          <label>Tuman/viloyat</label>
          <input name="tuman" defaultValue="Yunusobod" />
        </div>
        <div className="field">
          <label>Manzil</label>
          <input name="manzil" />
        </div>
        <div className="field">
          <label>Aholi soni (boshlang&apos;ich)</label>
          <input type="number" name="aholi" defaultValue={0} />
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>Mas&apos;ul bankir (ixtiyoriy)</label>
          <select name="mahallaBankiri" defaultValue="">
            <option value="">— keyinroq biriktiriladi —</option>
            {bankers
              .filter((b) => b.role === "BANKER")
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.ism}
                </option>
              ))}
          </select>
        </div>
      </div>
      {state?.error && <div className="err">{state.error}</div>}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Qo'shilmoqda..." : "Mahalla qo'shish"}
      </button>
    </form>
  );
}
