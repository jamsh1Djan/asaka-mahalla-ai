"use client";

import { useActionState, useState, useTransition } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  addBankerAction,
  toggleBankerMahallaAction,
  toggleBankerStatusAction,
  resetBankerPasswordAction,
  updateBankerCredentialsAction,
  deleteBankerAction,
  type AddBankerState,
} from "@/actions/bankers";
import { validatePassword } from "@/lib/password";
import { fmtDateTime } from "@/lib/format";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import type { Banker, Mahalla } from "@prisma/client";

type BankerWithMahallas = Banker & { mahallalar: { mahallaId: string }[] };

function fmtLastLogin(d: Date | null) {
  return d ? fmtDateTime(d) : "— hali kirmagan";
}

export default function AdminBankersPanel({
  bankers,
  mahallas,
  currentBankerId,
}: {
  bankers: BankerWithMahallas[];
  mahallas: Mahalla[];
  currentBankerId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction, addPending] = useActionState<AddBankerState, FormData>(
    addBankerAction,
    null
  );
  const [newPassword, setNewPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [tempPasswordFor, setTempPasswordFor] = useState<{ bankerId: string; password: string } | null>(null);
  const [deleteError, setDeleteError] = useState<{ bankerId: string; message: string } | null>(null);

  function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    const issue = validatePassword(newPassword);
    if (issue) {
      e.preventDefault();
      setLocalError(issue);
    } else {
      setLocalError(null);
    }
  }

  return (
    <div className="card">
      <div className="warn-box" style={{ marginBottom: 18, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          <b>Diqqat:</b> quyidagi demo login/parollar faqat namoyish uchun —
          <code> admin/admin2026</code>, <code>jamshidkarimov/123</code> va boshqa test
          bankirlari. Platformani productionga chiqarishdan oldin ularning barchasini
          albatta almashtiring.
        </span>
      </div>

      <h4 style={{ margin: "0 0 14px" }}>Bankirlar ro&apos;yxati</h4>
      <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>Ism</th>
            <th>Login</th>
            <th>Biriktirilgan mahallalar</th>
            <th>Oxirgi kirgan vaqt</th>
            <th>Status</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {bankers.map((b) => {
            const assigned = new Set(b.mahallalar.map((m) => m.mahallaId));
            const isSelf = b.id === currentBankerId;
            return (
              <tr key={b.id}>
                <td>
                  <input
                    className="mini-input"
                    style={{ width: 130 }}
                    defaultValue={b.ism}
                    disabled={isPending}
                    onBlur={(e) =>
                      startTransition(async () => {
                        await updateBankerCredentialsAction(b.id, { ism: e.target.value });
                      })
                    }
                  />
                </td>
                <td className="small-muted">{b.login}</td>
                <td className="table-wrap-cell">
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
                <td className="small-muted">{fmtLastLogin(b.lastLoginAt)}</td>
                <td>
                  <span className={`status-badge ${b.status === "FAOL" ? "status-bog" : "status-yangi"}`}>
                    {b.status === "FAOL" ? "Faol" : "Bloklangan"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={isPending || isSelf}
                      title={isSelf ? "O'zingizni bloklay olmaysiz" : undefined}
                      onClick={() =>
                        startTransition(() =>
                          toggleBankerStatusAction(b.id, b.status === "FAOL" ? "BLOKLANGAN" : "FAOL")
                        )
                      }
                    >
                      {b.status === "FAOL" ? "Bloklash" : "Blokdan chiqarish"}
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          const res = await resetBankerPasswordAction(b.id);
                          if ("tempPassword" in res) {
                            setTempPasswordFor({ bankerId: b.id, password: res.tempPassword });
                          }
                        })
                      }
                    >
                      Parolni reset qilish
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={isPending || isSelf}
                      title={isSelf ? "O'zingizni o'chira olmaysiz" : undefined}
                      style={{ color: "var(--red)" }}
                      onClick={() => {
                        if (!confirm(`"${b.ism}" hisobini butunlay o'chirishni tasdiqlaysizmi? Bu amalni orqaga qaytarib bo'lmaydi.`)) return;
                        startTransition(async () => {
                          const res = await deleteBankerAction(b.id);
                          if (res.error) setDeleteError({ bankerId: b.id, message: res.error });
                        });
                      }}
                    >
                      <Trash2 size={13} /> O&apos;chirish
                    </button>
                  </div>
                  {deleteError?.bankerId === b.id && (
                    <div className="err" style={{ marginTop: 8 }}>{deleteError.message}</div>
                  )}
                  {tempPasswordFor?.bankerId === b.id && (
                    <div className="ok-box" style={{ marginTop: 8, fontSize: 12.5 }}>
                      Vaqtinchalik parol: <code>{tempPasswordFor.password}</code>
                      <br />
                      Buni bankirga xavfsiz yo&apos;l bilan yetkazing — qayta ko&apos;rsatilmaydi.
                      <br />
                      <button
                        className="link-btn"
                        style={{ marginTop: 4 }}
                        onClick={() => setTempPasswordFor(null)}
                      >
                        Yopish
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
      <hr className="soft" />
      <h4>Yangi bankir qo&apos;shish</h4>
      <form action={formAction} onSubmit={handleAddSubmit}>
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
            <label>Telefon raqam</label>
            <input name="telefon" placeholder="+998 90 000 00 00" />
          </div>
          <div className="field">
            <label>Boshlang&apos;ich parol</label>
            <input
              name="parol"
              required
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setLocalError(null);
              }}
            />
            <PasswordStrengthMeter password={newPassword} />
          </div>
          <div className="field">
            <label>Rol</label>
            <select name="role" defaultValue="BANKER">
              <option value="BANKER">Mahalla bankiri</option>
              <option value="ADMIN">Super Admin</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Biriktirilgan mahalla(lar)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {mahallas.map((m) => (
              <label key={m.id} style={{ fontSize: 13 }}>
                <input type="checkbox" name="mahallaIds" value={m.id} /> {m.nomi}
              </label>
            ))}
          </div>
        </div>
        <p className="small-muted" style={{ margin: "4px 0 12px" }}>
          Birinchi marta kirganda tizim parolni majburiy almashtirishni so&apos;raydi.
        </p>
        {(localError || state?.error) && <div className="err">{localError || state?.error}</div>}
        <button className="btn btn-primary" type="submit" disabled={addPending}>
          {addPending ? "Qo'shilmoqda..." : "Qo'shish"}
        </button>
      </form>
    </div>
  );
}
