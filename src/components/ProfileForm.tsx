"use client";

import { useActionState } from "react";
import { saveProfileAction, type ProfileState } from "@/actions/bankers";
import type { Banker } from "@prisma/client";

export default function ProfileForm({ banker }: { banker: Banker }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    saveProfileAction,
    null
  );

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h4 style={{ margin: "0 0 14px" }}>Profil ma&apos;lumotlari</h4>
      <form action={formAction}>
        <div className="field">
          <label>Ism familiya</label>
          <input name="ism" defaultValue={banker.ism} required />
        </div>
        <div className="field">
          <label>Ish vaqti</label>
          <input name="ishVaqti" defaultValue={banker.ishVaqti ?? ""} placeholder="09:00 – 18:00" />
        </div>
        <div className="field">
          <label>Telefon raqami</label>
          <input name="telefon" defaultValue={banker.telefon ?? ""} placeholder="+998 90 000 00 00" />
        </div>
        <div className="field">
          <label>Telegram (bog&apos;lanish uchun)</label>
          <input name="telegram" defaultValue={banker.telegram ?? ""} placeholder="https://t.me/username" />
        </div>
        {state?.error && <div className="err">{state.error}</div>}
        {state?.success && <p className="small-muted">Profil yangilandi.</p>}
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
    </div>
  );
}
