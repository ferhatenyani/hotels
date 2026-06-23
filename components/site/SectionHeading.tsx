// The eyebrow + heading + marine hairline rule pattern, lifted verbatim from
// Rooms.tsx / Dining.tsx / Events.tsx / Contact.tsx. Every section across the
// site uses this; centralizing it keeps the rhythm consistent.

import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  /** Main heading. Pass a string (rendered as h2) or a node for custom markup. */
  heading: React.ReactNode;
  /** Optional supporting paragraph below the rule. */
  description?: React.ReactNode;
  /** When the section is on a dark surface (ink/marine bg), invert the colours. */
  invert?: boolean;
  /** Center align (used on page hero blocks). */
  align?: "left" | "center";
  /** Heading semantic level. Default h2. */
  as?: "h1" | "h2" | "h3";
  className?: string;
  /** Hide the marine rule when the layout already has its own divider. */
  noRule?: boolean;
};

export default function SectionHeading({
  eyebrow,
  heading,
  description,
  invert = false,
  align = "left",
  as: As = "h2",
  className,
  noRule = false,
}: Props) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p
        className={cn(
          "section-eyebrow font-sans text-[11px] uppercase tracking-[0.22em] mb-3 md:mb-4",
          invert ? "text-white/55" : "text-graybase",
        )}
      >
        {eyebrow}
      </p>
      <As
        className={cn(
          "section-heading font-display font-medium text-[28px] xs:text-[32px] sm:text-4xl lg:text-5xl tracking-tight leading-[1.08] text-balance",
          invert ? "text-white" : "text-ink",
        )}
      >
        {heading}
      </As>
      {!noRule && (
        <span
          aria-hidden
          className={cn(
            "section-rule mt-5 md:mt-6 block h-px w-14 bg-marine",
            align === "center" && "mx-auto",
          )}
        />
      )}
      {description && (
        <div
          className={cn(
            "section-description mt-5 md:mt-7 font-sans font-normal text-[15px] md:text-[16px] leading-[1.7] md:leading-[1.75] max-w-xl",
            align === "center" && "mx-auto",
            invert ? "text-white/70" : "text-graybase",
          )}
        >
          {description}
        </div>
      )}
    </div>
  );
}
