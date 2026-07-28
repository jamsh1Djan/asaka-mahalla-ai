export function fmt(n: number | string): string {
  return Number(n).toLocaleString("uz-UZ");
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
