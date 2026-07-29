import "server-only";
import { randomInt } from "node:crypto";

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I/O — avoids visual ambiguity
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const DIGITS = "23456789";

/** Generates a random 10-character password that always satisfies validatePassword(). */
export function generateTempPassword(): string {
  const pick = (chars: string) => chars[randomInt(chars.length)];
  const all = UPPER + LOWER + DIGITS;

  const required = [pick(UPPER), pick(DIGITS), pick(LOWER)];
  const rest = Array.from({ length: 7 }, () => pick(all));

  const chars = [...required, ...rest];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
