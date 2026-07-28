"use client";

import { useActionState, useTransition } from "react";
import {
  addBankerAction,
  toggleBankerMahallaAction,
  updateBankerCredentialsAction,
  type AddBankerState,
} from "@/actions/bankers";
import type { Banker, Mahalla } from "@prisma/client";

type BankerWithMahallas = Banker & { mahallalar: { mahallaId: string }[] };

export default function AdminBankersPanel({
  bankers,
  mahallas,
}: {
  bankers: BankerWithMahallas[];
  mahallas: Mahalla[];
}) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction, addPending] = useActionState<AddBankerState, FormData>(
    addBankerAction,
    null
  );

  return (
    <div className="card">
      <h4 style={{ margin: "0 0 14px" }}>Bankirlar ro&apos;yxati</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Ism</th>
            <th>Login</th>
            <th>Parol</th>
            <th>Biriktirilgan mahallalar</th>
          </tr>
        </thead>
        <tbody>
          {bankers.map((b) => {
            const assigned = new Set(b.mahallalar.map((m) => m.mahallaId));
            return (
              <tr key={b.id}>
                <td>
                  <input
                    className="mini-input"
                    style={{ width: 130 }}
                    defaultValue={b.ism}
                    disabled={isPending}
                    onBlur={(e) =>
                      startTransition(() =>
                        updateBankerCredentialsAction(b.id, { ism: e.target.value })
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    className="mini-input"
                    style={{ width: 110 }}
                    defaultValue={b.login}
                    disabled={isPending}
                    onBlur={(e) =>
                      startTransition(() =>
                        updateBankerCredentialsAction(b.id, { login: e.target.value })
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    className="mini-input"
                    style={{ width: 90 }}
                    placeholder="yangi parol"
                    disabled={isPending}
                    onBlur={(e) => {
                      if (!e.target.value) return;
                      startTransition(() =>
                        updateBankerCredentialsAction(b.id, { parol: e.target.value })
                      );
                      e.target.value = "";
                    }}
                  />
                </td>
                <td>
                  {mahallas.map((m) => (
                    <label key={m.id} style={{ fontSize: 11.5, marginRight: 6 }}>
                      <input
                        type="checkbox"
                        defaultChecked={assigned.has(m.id)}
                        disabled={isPending}
                        onChange={(e) =>
                          startTransition(() =>
                            toggleBankerMahallaAction(b.id, m.id, e.target.checked)
                          )
                        }
                      />{" "}
                      {m.nomi}
                    </label>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <hr className="soft" />
      <h4>Yangi bankir qo&apos;shish</h4>
      <form action={formAction}>
        <div className="grid grid-2">
          <div className="field">
            <label>Ism familiya</label>
            <input name="ism" required />
          </div>
          <div className="field">
            <label>Login</label>
            <input name="login" required />
          </div>
          <div className="field">
            <label>Parol</label>
            <input name="parol" required />
          </div>
        </div>
        {state?.error && <div className="err">{state.error}</div>}
        <button className="btn btn-primary" type="submit" disabled={addPending}>
          {addPending ? "Qo'shilmoqda..." : "Qo'shish"}
        </button>
      </form>
    </div>
  );
}
