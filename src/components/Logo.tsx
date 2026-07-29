/** Brand mark — pointed arch (hoshiya gold), tree + houses silhouette,
 * red "A" tile at the base. Used in the header, splash intro, and footer.
 * `onDark` swaps the house silhouette to a light tone for use on the navy
 * splash background, where the default navy fill would disappear. */
export default function LogoMark({ size = 36, onDark = false }: { size?: number; onDark?: boolean }) {
  const houseFill = onDark ? "#dbe6f2" : "var(--navy)";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M10 56 L10 28 Q10 8 32 6 Q54 8 54 28 L54 56"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 40 L23 40 L23 33 L19.5 30 L16 33 Z"
        fill={houseFill}
      />
      <path
        d="M41 40 L48 40 L48 33 L44.5 30 L41 33 Z"
        fill={houseFill}
      />
      <circle cx="32" cy="26" r="10" fill="#2E7D32" />
      <circle cx="26" cy="30" r="6.5" fill="#2E7D32" />
      <circle cx="38" cy="30" r="6.5" fill="#2E7D32" />
      <rect x="30" y="32" width="4" height="12" rx="1.5" fill="#5b4326" />
      <rect x="24" y="48" width="16" height="12" rx="2.5" fill="var(--red)" />
      <path d="M24 60 L32 50 L40 60 Z" fill="#fff" opacity="0.9" />
    </svg>
  );
}
