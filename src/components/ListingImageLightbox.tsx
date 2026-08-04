"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/** Renders 1-2 listing images as a small in-card grid; clicking any of them
 * opens a full-screen modal with prev/next. No carousel library needed for
 * just two images — plain useState is enough. */
export default function ListingImageLightbox({ images, alt }: { images: string[]; alt: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className={`listing-image-grid${images.length > 1 ? " listing-image-grid-2" : ""}`}>
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            className="listing-image-btn"
            onClick={() => setOpenIndex(i)}
            aria-label={`${alt} — rasm ${i + 1}`}
          >
            <Image src={src} alt={alt} fill sizes="(max-width: 700px) 50vw, 320px" style={{ objectFit: "cover" }} />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div className="lightbox-overlay" onClick={() => setOpenIndex(null)}>
          <button className="lightbox-close" onClick={() => setOpenIndex(null)} aria-label="Yopish">
            <X size={22} />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="lightbox-nav lightbox-prev"
                aria-label="Oldingi rasm"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIndex((openIndex - 1 + images.length) % images.length);
                }}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                className="lightbox-nav lightbox-next"
                aria-label="Keyingi rasm"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIndex((openIndex + 1) % images.length);
                }}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[openIndex]}
            alt={alt}
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
