"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2, LogIn } from "lucide-react";
import { submitArizaAction, type ArizaState } from "@/actions/applications";
import { CREDIT_PRODUCTS } from "@/lib/data";

export default function ArizaForm({
  mahallaId,
  mahallaNomi,
  loggedIn,
  defaultName,
  defaultPhone,
}: {
  mahallaId: string;
  mahallaNomi: string;
  loggedIn: boolean;
  defaultName?: string;
  defaultPhone?: string;
}) {
  const action = submitArizaAction.bind(null, mahallaId);
  const [state, formAction, pending] = useActionState<ArizaState, FormData>(action, null);

  if (!loggedIn) {
    return (
      <div className="ok-box" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <LogIn size={18} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          Ariza berish uchun avval tizimga kiring.
          <br />
          <br />
          <Link href="/kirish" className="btn btn-primary btn-sm">
            Tizimga kirish
          </Link>
        </span>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="ok-box" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          Arizangiz qabul qilindi.
          <br />
          <br />
          Mahalla bankiri ko&apos;rib chiqadi va siz bilan bog&apos;lanadi. Javobni qo&apos;ng&apos;iroq
          yoki SMS orqali bildiradi.
        </span>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <p className="sub" style={{ marginTop: 0 }}>
        {mahallaNomi} mahallasi bankiriga ariza yuboriladi
      </p>
      <div className="field">
        <label>Ism familiya</label>
        <input name="fio" defaultValue={defaultName} placeholder="Ism familiyangiz" required />
      </div>
      <div className="field">
        <label>Telefon raqami</label>
        <input name="phone" defaultValue={defaultPhone} placeholder="+998 90 000 00 00" required />
      </div>
      <div className="field">
        <label>Qaysi kredit turi qiziqtiradi</label>
        <select name="kredit" defaultValue={CREDIT_PRODUCTS[0].nomi}>
          {CREDIT_PRODUCTS.map((c) => (
            <option key={c.id}>{c.nomi}</option>
          ))}
          <option>Boshqa / bilmayman</option>
        </select>
      </div>
      <div className="field">
        <label>Qisqacha izoh</label>
        <textarea name="izoh" rows={3} placeholder="Biznes g'oyangiz yoki savolingiz" />
      </div>
      {state?.error && <div className="err">{state.error}</div>}
      <button
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
        type="submit"
        disabled={pending}
      >
        {pending ? "Yuborilmoqda..." : "Arizani yuborish"}
      </button>
    </form>
  );
}
