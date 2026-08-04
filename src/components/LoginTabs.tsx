"use client";

import { useActionState, useState } from "react";
import { citizenLoginAction, bankerLoginAction, type AuthState } from "@/actions/auth";

export default function LoginTabs({
  initialTab,
  next,
}: {
  initialTab: "fuqaro" | "banker";
  next?: string;
}) {
  const [tab, setTab] = useState<"fuqaro" | "banker">(initialTab);
  const [citizenState, citizenFormAction, citizenPending] = useActionState<AuthState, FormData>(
    citizenLoginAction,
    null
  );
  const [bankerState, bankerFormAction, bankerPending] = useActionState<AuthState, FormData>(
    bankerLoginAction,
    null
  );

  return (
    <div className="modal" style={{ maxWidth: 460, margin: "40px auto" }}>
      <h3>Xush kelibsiz</h3>
      <p className="sub">Tizimga kirish usulini tanlang</p>
      <div className="tabs">
        <button type="button" className={tab === "fuqaro" ? "active" : ""} onClick={() => setTab("fuqaro")}>
          Fuqaro sifatida
        </button>
        <button type="button" className={tab === "banker" ? "active" : ""} onClick={() => setTab("banker")}>
          Mahalla bankiri
        </button>
      </div>

      {tab === "fuqaro" ? (
        <form action={citizenFormAction}>
          {next && <input type="hidden" name="next" value={next} />}
          <div className="field">
            <label>Ism familiya</label>
            <input name="name" placeholder="Masalan: Aliyev Vali" required />
          </div>
          <div className="field">
            <label>Telefon raqami</label>
            <input name="phone" placeholder="+998 90 000 00 00" required />
          </div>
          <p className="small-muted" style={{ marginTop: -8, marginBottom: 12 }}>
            Birinchi marta kirsangiz, shu raqam bilan hisobingiz avtomatik yaratiladi.
          </p>
          {citizenState?.error && <div className="err">{citizenState.error}</div>}
          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            type="submit"
            disabled={citizenPending}
          >
            {citizenPending ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>
      ) : (
        <form action={bankerFormAction}>
          <div className="field">
            <label>Login</label>
            <input name="login" placeholder="login" required />
          </div>
          <div className="field">
            <label>Parol</label>
            <input name="password" type="password" placeholder="••••••" required />
          </div>
          {bankerState?.error && <div className="err">{bankerState.error}</div>}
          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
            type="submit"
            disabled={bankerPending}
          >
            {bankerPending ? "Kirilmoqda..." : "Kirish"}
          </button>
          <p className="small-muted" style={{ marginTop: 12 }}>
            Demo: jamshidkarimov / 123
          </p>
        </form>
      )}
    </div>
  );
}
