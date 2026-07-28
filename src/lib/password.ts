// Shared between client (live strength meter) and server (enforced validation) —
// intentionally has no "use server"/"server-only" marker so both sides can import it.

export const WEAK_PASSWORD_MESSAGE =
  "Bu parol juda oddiy — kamida 8 ta belgi, bitta raqam va bitta katta harf ishlating.";

export function passwordCriteria(password: string) {
  return {
    length: password.length >= 8,
    digit: /[0-9]/.test(password),
    upper: /[A-Z]/.test(password),
  };
}

/** Returns null when the password meets all requirements, otherwise the warning message. */
export function validatePassword(password: string): string | null {
  const c = passwordCriteria(password);
  return c.length && c.digit && c.upper ? null : WEAK_PASSWORD_MESSAGE;
}

export type PasswordStrength = "zaif" | "ortacha" | "kuchli";

export function passwordStrength(password: string): PasswordStrength {
  if (!password) return "zaif";
  const c = passwordCriteria(password);
  const metCount = Number(c.length) + Number(c.digit) + Number(c.upper);
  const hasExtra = password.length >= 12 || /[^A-Za-z0-9]/.test(password);
  if (metCount === 3 && hasExtra) return "kuchli";
  if (metCount === 3) return "ortacha";
  if (metCount >= 1) return "zaif";
  return "zaif";
}
