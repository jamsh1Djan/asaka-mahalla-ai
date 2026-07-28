"use client";

import { useActionState, useState, useTransition } from "react";
import {
  addBankerAction,
  toggleBankerMahallaAction,
  updateBankerCredentialsAction,
  type AddBankerState,
} from "@/actions/bankers";
import { validatePassword } from "@/lib/password";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
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
  const [newPassword, setNewPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

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
      <div className="warn-box" style={{ marginBottom: 18 }}>
        ⚠️ <b>Diqqat:</b> quyidagi demo login/parollar faqat namoyish uchun —
        <code> admin/admin2026</code>, <code>jamshidkarimov/123</code> va boshqa test
        bankirlari. Platformani productionga chiqarishdan oldin ularning barchasini
        albatta almashtiring.
      </div>

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
                      startTransition(async () => {
                        await updateBankerCredentialsAction(b.id, { ism: e.target.value });
                      })
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
                      startTransition(async () => {
                        await updateBankerCredentialsAction(b.id, { login: e.target.value });
                      })
                    }
                  />
                </td>
                <td>
                  <BankerPasswordCell bankerId={b.id} disabled={isPending} />
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
            <label>Parol</label>
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
        </div>
        {(localError || state?.error) && <div className="err">{localError || state?.error}</div>}
        <button className="btn btn-primary" type="submit" disabled={addPending}>
          {addPending ? "Qo'shilmoqda..." : "Qo'shish"}
        </button>
      </form>
    </div>
  );
}

function BankerPasswordCell({ bankerId, disabled }: { bankerId: string; disabled: boolean }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function commit() {
    if (!value) return;
    const issue = validatePassword(value);
    if (issue) {
      setError(issue);
      return;
    }
    startTransition(async () => {
      const res = await updateBankerCredentialsAction(bankerId, { parol: value });
      if (res.error) {
        setError(res.error);
      } else {
        setError(null);
        setValue("");
      }
    });
  }

  return (
    <div>
      <input
        className="mini-input"
        style={{ width: 100 }}
        placeholder="yangi parol"
        value={value}
        disabled={disabled || pending}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
        }}
        onBlur={commit}
      />
      <PasswordStrengthMeter password={value} />
      {error && (
        <div className="err" style={{ marginTop: 4, marginBottom: 0, fontSize: 11, maxWidth: 160 }}>
          {error}
        </div>
      )}
    </div>
  );
}
