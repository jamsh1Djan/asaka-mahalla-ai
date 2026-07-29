"use client";

import { useActionState } from "react";
import { updateSystemSettingsAction, type SettingsState } from "@/actions/settings";

export default function AdminSettingsPanel({ aiPlannerYoqilgan }: { aiPlannerYoqilgan: boolean }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    updateSystemSettingsAction,
    null
  );

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h4 style={{ margin: "0 0 4px" }}>Tizim sozlamalari</h4>
      <p className="small-muted" style={{ marginBottom: 16 }}>
        Platforma darajasidagi parametrlar — barcha foydalanuvchilarga ta&apos;sir qiladi.
      </p>
      <form action={formAction}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, fontSize: 14 }}>
          <input type="checkbox" name="aiPlannerYoqilgan" defaultChecked={aiPlannerYoqilgan} />
          AI biznes-reja tavsiyachisini yoqish
        </label>
        <p className="small-muted" style={{ marginTop: -12, marginBottom: 16 }}>
          O&apos;chirilgan holatda mahalla sahifalarida AI tavsiyachi bloki fuqarolarga
          ko&apos;rinmaydi.
        </p>
        {state?.error && <div className="err">{state.error}</div>}
        {state?.success && <p className="small-muted">Saqlandi.</p>}
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </form>
    </div>
  );
}
