"use client";

import { useActionState, useEffect } from "react";
import { createBusinessAction, updateBusinessAction, type BusinessState } from "@/actions/businesses";
import type { Business } from "@prisma/client";

const TURI_OPTIONS = ["Savdo", "Xizmat ko'rsatish", "Ishlab chiqarish", "Boshqa"];

export default function BusinessForm({
  mahallaId,
  business,
  onDone,
}: {
  mahallaId: string;
  business?: Business;
  onDone?: () => void;
}) {
  const isEdit = !!business;
  const action = isEdit
    ? updateBusinessAction.bind(null, business.id)
    : createBusinessAction.bind(null, mahallaId);
  const [state, formAction, pending] = useActionState<BusinessState, FormData>(action, null);

  useEffect(() => {
    if (state?.success) onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction}>
      <div className="grid grid-2">
        <div className="field">
          <label>Korxona nomi</label>
          <input name="nomi" defaultValue={business?.nomi} required />
        </div>
        <div className="field">
          <label>Faoliyat yo&apos;nalishi</label>
          <select name="turi" defaultValue={business?.turi ?? TURI_OPTIONS[0]}>
            {TURI_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Manzil</label>
          <input name="manzil" defaultValue={business?.manzil} required />
        </div>
        <div className="field">
          <label>Telefon (ixtiyoriy)</label>
          <input name="telefon" defaultValue={business?.telefon ?? undefined} placeholder="+998 90 000 00 00" />
        </div>
      </div>
      {state?.error && <div className="err">{state.error}</div>}
      <button className="btn btn-primary btn-sm" type="submit" disabled={pending}>
        {pending ? "Saqlanmoqda..." : isEdit ? "Saqlash" : "Qo'shish"}
      </button>
    </form>
  );
}
