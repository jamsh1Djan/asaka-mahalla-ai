"use client";

import { useState, useTransition } from "react";
import {
  toggleBankerStatusAction,
  resetBankerPasswordAction,
  updateBankerCredentialsAction,
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

  return (
    <div className="card">
      <h4 style={{ margin: "0 0 4px" }}>Login-parollar bazasi</h4>
      <p className="small-muted" style={{ marginBottom: 16 }}>
        Mavjud parolni hech kim — hatto Super Admin ham — ochiq holda ko&apos;rmaydi. Faqat
        yangi (vaqtinchalik) parol generatsiya qilib beriladi.
      </p>
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
                  </div>
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
  );
}
