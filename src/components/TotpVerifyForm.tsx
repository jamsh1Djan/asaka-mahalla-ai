"use client";

import { useActionState } from "react";
import { verifyTotpAction, type TotpState } from "@/actions/auth";

export default function TotpVerifyForm() {
  const [state, formAction, pending] = useActionState<TotpState, FormData>(verifyTotpAction, null);

  return (
    <form action={formAction}>
      <div className="field">
        <label>Autentifikator ilovasidagi 6 xonali kod</label>
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          style={{ fontSize: 22, letterSpacing: 6, textAlign: "center" }}
          autoFocus
          required
        />
      </div>
      {state?.error && <div className="err">{state.error}</div>}
      <button
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
        type="submit"
        disabled={pending}
      >
        {pending ? "Tekshirilmoqda..." : "Tasdiqlash"}
      </button>
    </form>
  );
}
