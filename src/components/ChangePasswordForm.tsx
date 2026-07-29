"use client";

import { useActionState, useState } from "react";
import { changePasswordAction, type ChangePasswordState } from "@/actions/bankers";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ChangePasswordState, FormData>(
    changePasswordAction,
    null
  );
  const [password, setPassword] = useState("");

  return (
    <form action={formAction}>
      <div className="field">
        <label>Yangi parol</label>
        <input
          name="yangiParol"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordStrengthMeter password={password} />
      </div>
      <div className="field">
        <label>Yangi parolni tasdiqlang</label>
        <input name="tasdiqlash" type="password" required />
      </div>
      {state?.error && <div className="err">{state.error}</div>}
      <button
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
        type="submit"
        disabled={pending}
      >
        {pending ? "Saqlanmoqda..." : "Parolni saqlash va davom etish"}
      </button>
    </form>
  );
}
