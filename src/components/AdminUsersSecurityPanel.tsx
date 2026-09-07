"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  toggleBankerStatusAction,
  resetBankerPasswordAction,
  updateBankerCredentialsAction,
  deleteBankerAction,
} from "@/actions/bankers";
import { fmtDateTime } from "@/lib/format";
import type { Banker, Role } from "@prisma/client";

function fmtLastLogin(d: Date | null) {
  return d ? fmtDateTime(d) : "— hali kirmagan";
}

export default function AdminUsersSecurityPanel({
  users,
  currentBankerId,
}: {
  users: Banker[];
  currentBankerId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [tempPasswordFor, setTempPasswordFor] = useState<{ bankerId: string; password: string } | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<{ bankerId: string; message: string } | null>(null);

  return (
    <div className="card">
      <h4 style={{ margin: "0 0 4px" }}>Login-parollar bazasi</h4>
      <p className="small-muted" style={{ marginBottom: 16 }}>
        Mavjud parolni hech kim — hatto Super Admin ham — ochiq holda ko&apos;rmaydi. Faqat
        yangi (vaqtinchalik) parol generatsiya qilib beriladi.
      </p>
      <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>Login</th>
            <th>Ism</th>
            <th>Rol</th>
            <th>2FA</th>
            <th>Oxirgi kirgan vaqt</th>
            <th>Status</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u.id === currentBankerId;
            return (
              <tr key={u.id}>
                <td>{u.login}</td>
                <td>{u.ism}</td>
                <td>
                  <select
                    className="mini-input"
                    style={{ width: 110 }}
                    defaultValue={u.role}
                    disabled={isPending || isSelf}
                    title={isSelf ? "O'z rolingizni bu yerdan o'zgartira olmaysiz" : undefined}
                    onChange={(e) =>
                      startTransition(async () => {
                        await updateBankerCredentialsAction(u.id, { role: e.target.value as Role });
                      })
                    }
                  >
                    <option value="BANKER">Bankir</option>
                    <option value="ADMIN">Super Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${u.totpEnabled ? "status-bog" : "status-korib"}`}>
                    {u.totpEnabled ? "Yoqilgan" : "O'chiq"}
                  </span>
                </td>
                <td className="small-muted">{fmtLastLogin(u.lastLoginAt)}</td>
                <td>
                  <span className={`status-badge ${u.status === "FAOL" ? "status-bog" : "status-yangi"}`}>
                    {u.status === "FAOL" ? "Faol" : "Bloklangan"}
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
                          toggleBankerStatusAction(u.id, u.status === "FAOL" ? "BLOKLANGAN" : "FAOL")
                        )
                      }
                    >
                      {u.status === "FAOL" ? "Bloklash" : "Blokdan chiqarish"}
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          const res = await resetBankerPasswordAction(u.id);
                          if ("tempPassword" in res) {
                            setTempPasswordFor({ bankerId: u.id, password: res.tempPassword });
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
                        if (!confirm(`"${u.ism}" hisobini butunlay o'chirishni tasdiqlaysizmi? Bu amalni orqaga qaytarib bo'lmaydi.`)) return;
                        startTransition(async () => {
                          const res = await deleteBankerAction(u.id);
                          if (res.error) setDeleteError({ bankerId: u.id, message: res.error });
                        });
                      }}
                    >
                      <Trash2 size={13} /> O&apos;chirish
                    </button>
                  </div>
                  {deleteError?.bankerId === u.id && (
                    <div className="err" style={{ marginTop: 8 }}>{deleteError.message}</div>
                  )}
                  {tempPasswordFor?.bankerId === u.id && (
                    <div className="ok-box" style={{ marginTop: 8, fontSize: 12.5 }}>
                      Vaqtinchalik parol: <code>{tempPasswordFor.password}</code>
                      <br />
                      Buni foydalanuvchiga xavfsiz yo&apos;l bilan yetkazing.
                      <br />
                      <button className="link-btn" style={{ marginTop: 4 }} onClick={() => setTempPasswordFor(null)}>
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
    </div>
  );
}
