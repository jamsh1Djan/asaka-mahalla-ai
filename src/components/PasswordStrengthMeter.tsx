"use client";

import { passwordStrength } from "@/lib/password";

const CONFIG = {
  zaif: { color: "#C8102E", label: "Zaif", width: "33%" },
  ortacha: { color: "#C69C4E", label: "O'rtacha", width: "66%" },
  kuchli: { color: "#2b7a43", label: "Kuchli", width: "100%" },
} as const;

export default function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const strength = passwordStrength(password);
  const { color, label, width } = CONFIG[strength];

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 5, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
        <div style={{ height: "100%", width, background: color, transition: "width .15s, background .15s" }} />
      </div>
      <span style={{ fontSize: 11.5, color, fontWeight: 700 }}>{label}</span>
    </div>
  );
}
