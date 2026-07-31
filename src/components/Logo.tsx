import Image from "next/image";

// logo-mark.png is the full lockup (icon + "Asaka Mahalla AI" wordmark +
// tagline) — fine shrunk small in the navbar/footer next to the real brand
// text, but at splash size the embedded wordmark becomes legible and
// duplicates the splash's own animated title, and its card-shaped backdrop
// reads as a pasted-on sticker against the dark background. logo-icon.png
// is the same source cropped to just the arch/tree/houses mark for that
// case. Native pixel sizes differ per crop, so each has its own aspect ratio.
const VARIANTS = {
  full: { src: "/assets/logo-mark.png", width: 220, height: 266 },
  icon: { src: "/assets/logo-icon.png", width: 220, height: 155 },
};

/** Real brand mark (public/assets/logo-mark.png / logo-icon.png). `size`
 * sets the rendered width; height follows the chosen variant's own aspect
 * ratio. Passing the image's true intrinsic dimensions as width/height
 * (rather than pre-scaled numbers) and doing the display-size override
 * purely in `style` is the combination Next's image component expects here. */
export default function LogoMark({
  size = 20,
  variant = "full",
}: {
  size?: number;
  variant?: keyof typeof VARIANTS;
}) {
  const v = VARIANTS[variant];
  return (
    <Image
      src={v.src}
      alt="Asaka Mahalla AI"
      width={v.width}
      height={v.height}
      style={{ width: size, height: "auto" }}
      priority
    />
  );
}
