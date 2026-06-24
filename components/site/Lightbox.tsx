// Lightbox — keyboard-driven image viewer used by /gallery. Mounted at the
// page root and opened by passing an index; passes responsibility for the
// image list to the caller so the same component can serve any gallery.
//
// Interactions:
//  - Esc → close
//  - ← / → → previous / next
//  - Backdrop click → close
//  - Buttons (prev/next/close) → ≥ 44 px touch targets
//
// Visual: ink/85 backdrop (per AGENTS.md callout — not cream), centered
// image. No marquee or fancy transitions: a soft fade + small slide on
// nav. Framer Motion is already in package.json so we use it for the fade.

"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type LightboxImage = {
  src: string;
  alt: string;
  caption?: string;
};

type Props = {
  images: LightboxImage[];
  /** null = closed; number = index of the currently open image. */
  index: number | null;
  onClose: () => void;
  onChange: (next: number) => void;
};

export default function Lightbox({ images, index, onClose, onChange }: Props) {
  const isOpen = index !== null;

  const goPrev = useCallback(() => {
    if (index === null) return;
    onChange((index - 1 + images.length) % images.length);
  }, [index, images.length, onChange]);

  const goNext = useCallback(() => {
    if (index === null) return;
    onChange((index + 1) % images.length);
  }, [index, images.length, onChange]);

  // Keyboard nav. Bound to window so the user doesn't have to click in first.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, goPrev, goNext]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const current = index !== null ? images[index] : null;

  return (
    <AnimatePresence>
      {isOpen && current && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-0 z-[120] bg-ink/[0.85] backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${index! + 1} sur ${images.length}`}
        >
          {/* Backdrop click → close. Buttons stop propagation. */}
          <button
            type="button"
            aria-label="Fermer la galerie"
            onClick={onClose}
            className="absolute inset-0 cursor-zoom-out"
          />

          {/* Close — top-right, safe-area padding for notched phones. */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>

          {/* Counter — top-left, also safe-area aware. */}
          <div className="absolute top-[max(0.95rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))] z-10 font-display text-[13px] text-white/85 tabular-nums tracking-tight">
            <span>{String(index! + 1).padStart(2, "0")}</span>
            <span className="mx-1.5 text-white/45">/</span>
            <span>{String(images.length).padStart(2, "0")}</span>
          </div>

          {/* Image stage. Centered, fits the viewport. */}
          <div className="relative min-h-dvh w-full flex items-center justify-center px-4 sm:px-8 lg:px-20 py-16 sm:py-20 pointer-events-none">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-[1280px] max-h-[80dvh] flex flex-col items-center"
            >
              <div className="relative w-full max-h-[78dvh] aspect-[3/2] sm:aspect-[16/10]">
                <Image
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="100vw"
                  priority
                  className="object-contain"
                />
              </div>
              {current.caption && (
                <p className="mt-5 text-center font-sans text-[13px] md:text-[14px] text-white/75 leading-[1.6] max-w-[60ch]">
                  {current.caption}
                </p>
              )}
            </motion.div>
          </div>

          {/* Prev / next — fixed mid-vertical, large hit targets. */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Image précédente"
                className="absolute top-1/2 left-[max(0.5rem,env(safe-area-inset-left))] -translate-y-1/2 z-10 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Image suivante"
                className="absolute top-1/2 right-[max(0.5rem,env(safe-area-inset-right))] -translate-y-1/2 z-10 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <ChevronRight className="h-6 w-6" strokeWidth={1.75} />
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
