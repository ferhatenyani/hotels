// Editorial page hero used by every secondary route (rooms, dining, events,
// experiences, about, contact, etc.). Slimmer than the home hero — no video,
// no booking widget — but inherits the same rhythm (eyebrow / display heading
// / hairline rule / optional kicker copy) and the same image-card treatment
// (rounded card, grain overlay, gradient scrim for legibility).
//
// Mobile-first:
//  - 56svh on phones (leaves room for the floating nav pill above and the
//    in-page content below the fold)
//  - 64svh on tablet, 72svh on desktop
//  - copy lives in the bottom-left of the card on every viewport — easiest to
//    scan, never collides with the centered nav wordmark

import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  heading: React.ReactNode;
  description?: React.ReactNode;
  image: string;
  imageAlt: string;
  /** Optional CTA row rendered under the description. */
  cta?: React.ReactNode;
  /** Override the default scrim — set "none" when the image is already dark. */
  scrim?: "default" | "soft" | "strong" | "none";
  /** Override height. Defaults to a slim-editorial scale. */
  height?: "short" | "default" | "tall";
};

const scrimClass = {
  none: "",
  soft: "bg-gradient-to-b from-ink/30 via-ink/0 to-ink/50",
  default: "bg-gradient-to-b from-ink/45 via-ink/15 to-ink/65",
  strong: "bg-gradient-to-b from-ink/65 via-ink/30 to-ink/80",
};

const heightClass = {
  short: "h-[44svh] min-h-[320px] sm:h-[50svh] md:h-[420px] lg:h-[480px]",
  default: "h-[56svh] min-h-[380px] sm:h-[60svh] md:h-[520px] lg:h-[600px]",
  tall: "h-[68svh] min-h-[460px] sm:h-[72svh] md:h-[620px] lg:h-[720px]",
};

export default function PageHero({
  eyebrow,
  heading,
  description,
  image,
  imageAlt,
  cta,
  scrim = "default",
  height = "default",
}: Props) {
  return (
    <section className="bg-white pt-[72px] sm:pt-[88px] md:pt-3 lg:pt-5">
      {/* Same card-treatment as the home hero: outer page padding, then a
          rounded image card with internal padding for the copy. */}
      <div className="px-4 md:p-3 lg:p-5">
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-2xl md:rounded-xl lg:rounded-2xl bg-ink shadow-[0_30px_80px_-30px_rgba(21,19,22,0.35)]",
            heightClass[height],
          )}
        >
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {scrim !== "none" && (
            <div aria-hidden className={cn("absolute inset-0", scrimClass[scrim])} />
          )}

          {/* Copy bottom-left, mirrors the home hero's anchor position. */}
          <div className="absolute inset-0 flex flex-col justify-end px-5 sm:px-10 lg:px-14 pb-8 sm:pb-12 lg:pb-16">
            <div className="overflow-hidden">
              <p className="font-sans text-[11px] sm:text-[12px] uppercase tracking-[0.24em] text-white/85">
                {eyebrow}
              </p>
            </div>
            <h1 className="mt-3 font-display font-medium text-white text-[32px] xs:text-[36px] sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight max-w-[16ch] text-balance [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
              {heading}
            </h1>
            {description && (
              <p className="mt-3 sm:mt-4 font-sans font-normal text-[14px] sm:text-[16px] leading-[1.6] text-white/85 max-w-[48ch] [text-shadow:0_1px_16px_rgba(0,0,0,0.35)]">
                {description}
              </p>
            )}
            {cta && (
              <div className="mt-5 sm:mt-7 flex flex-wrap items-center gap-3">
                {cta}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
