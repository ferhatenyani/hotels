// Standardized section wrapper. Consolidates the px-4 sm:px-6 lg:px-10
// py-14 md:py-20 lg:py-[120px] rhythm + max-w-[1280px] centered container
// that every section in the existing site uses, so spawn-built pages
// inherit the same rhythm without re-stating it everywhere.

import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  children: React.ReactNode;
  /** Visual tone — drives bg + body text colour. */
  tone?: "white" | "cream" | "ink";
  /** Use a tighter top/bottom rhythm for compact sections. */
  size?: "default" | "compact";
  /** Add the grain overlay class (cream/ink tones use it most often). */
  grain?: boolean;
  /** Skip the inner max-w container, e.g. for full-bleed image rows. */
  fullBleed?: boolean;
  className?: string;
  /** Override max-width for the inner container (default 1280px). */
  maxWidth?: "narrow" | "default" | "wide";
};

const toneClass = {
  white: "bg-white text-ink",
  cream: "bg-cream text-ink",
  ink: "bg-ink text-white",
};

const sizeClass = {
  default: "py-14 md:py-20 lg:py-[120px]",
  compact: "py-10 md:py-14 lg:py-20",
};

const maxWidthClass = {
  narrow: "max-w-[920px]",
  default: "max-w-[1280px]",
  wide: "max-w-[1440px]",
};

export default function Section({
  id,
  children,
  tone = "white",
  size = "default",
  grain = false,
  fullBleed = false,
  className,
  maxWidth = "default",
}: Props) {
  return (
    <section
      id={id}
      className={cn(
        toneClass[tone],
        sizeClass[size],
        grain && "grain",
        "relative",
        // Section-side padding only when not full-bleed
        !fullBleed && "px-4 sm:px-6 lg:px-10",
        className,
      )}
    >
      {fullBleed ? (
        children
      ) : (
        <div className={cn(maxWidthClass[maxWidth], "mx-auto")}>{children}</div>
      )}
    </section>
  );
}
