/** Brand glyph — simple house/bank mark, rendered on the gradient
 * "mark" square in the navbar, footer, and splash intro. */
export default function LogoMark({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l7 6v11a1 1 0 0 1-1 1h-4v-6H10v6H6a1 1 0 0 1-1-1V9l7-6z" />
    </svg>
  );
}
