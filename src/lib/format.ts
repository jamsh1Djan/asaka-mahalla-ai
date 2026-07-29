// Deterministic, ICU-independent formatting. Node's default ("small-icu") build
// only ships full data for en-US, so `.toLocaleString("uz-UZ")` silently
// falls back to a different format server-side than the browser (which has
// full ICU) produces — a classic SSR/CSR hydration mismatch. Formatting by
// hand here keeps server and client output byte-identical.

export function fmt(n: number | string): string {
  const num = Math.round(Number(n));
  const sign = num < 0 ? "-" : "";
  const digits = Math.abs(num).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return sign + grouped;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function fmtDate(d: Date | string): string {
  const date = new Date(d);
  return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}`;
}

export function fmtDateTime(d: Date | string): string {
  const date = new Date(d);
  return `${fmtDate(date)} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function initials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
