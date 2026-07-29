"use client";

import { useActionState } from "react";
import { updateSystemSettingsAction, type SettingsState } from "@/actions/settings";

export default function AdminSettingsPanel({
  aiPlannerYoqilgan,
  enforce2faForAdmins,
}: {
  aiPlannerYoqilgan: boolean;
  enforce2faForAdmins: boolean;
}) {
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
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: 14 }}>
          <input type="checkbox" name="aiPlannerYoqilgan" defaultChecked={aiPlannerYoqilgan} />
          AI biznes-reja tavsiyachisini yoqish
        </label>
        <p className="small-muted" style={{ marginBottom: 18 }}>
          O&apos;chirilgan holatda mahalla sahifalarida AI tavsiyachi bloki fuqarolarga
          ko&apos;rinmaydi.
        </p>

        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: 14 }}>
          <input type="checkbox" name="enforce2faForAdmins" defaultChecked={enforce2faForAdmins} />
          Super Admin hisoblari uchun 2FA&apos;ni majburiy qilish
        </label>
        <p className="small-muted" style={{ marginBottom: 18 }}>
          Yoqilgan holatda 2FA sozlamagan Super Admin hisoblari profil sahifasidan uni
          sozlashi tavsiya etiladi (hozircha eslatma sifatida ko&apos;rsatiladi).
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
