// Canonical button surfaces used across the new pages. These mirror the
// existing in-component button styles (marine fill, ink-bordered ghost,
// cream-on-ink) so spawn-built pages don't reinvent each CTA. Anchor and
// button variants both work — pass `href` to render a Next Link, otherwise
// a button.

"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "ghost-light";
type Size = "default" | "compact" | "large";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-marine text-white border border-marine hover:bg-marine/90 focus-visible:outline-marine",
  secondary:
    "bg-white text-ink border border-ink/25 hover:bg-marine hover:border-marine hover:text-white focus-visible:outline-marine",
  ghost:
    "bg-transparent text-ink border border-ink/30 hover:bg-ink hover:text-white focus-visible:outline-ink",
  "ghost-light":
    "bg-transparent text-white border border-white/40 hover:bg-white hover:text-ink focus-visible:outline-white",
};

// Typography comes from the shared .btn-text-* tokens (see globals.css).
// Sizes here own height/padding only — never font/letter-spacing.
const sizeClass: Record<Size, string> = {
  compact: "h-10 px-4 btn-text-sm",
  default: "h-12 px-6 btn-text-md max-md:min-h-[48px] max-md:px-6",
  large: "h-14 px-8 btn-text-lg max-md:min-h-[52px] max-md:px-6",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  /** Show the standard arrow on the right. */
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

type LinkProps = CommonProps & {
  href: string;
  /** Routes to outside the app — renders plain anchor with target if set. */
  external?: boolean;
};

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

// Font family / weight / case / tracking live in the .btn-text-* tokens
// applied via sizeClass — keep this base purely structural.
const baseClass =
  "group/btn inline-flex items-center justify-center gap-2 rounded-full transition-colors duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-40 disabled:pointer-events-none";

// Polymorphic factory — keeps the prop-forwarding clean.
export const Button = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  LinkProps | ButtonProps
>(function Button(props, ref) {
  const {
    variant = "primary",
    size = "default",
    arrow = false,
    className,
    children,
  } = props;

  const inner = (
    <>
      <span className="inline-flex items-center">{children}</span>
      {arrow && (
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/btn:translate-x-0.5"
          strokeWidth={2.25}
        />
      )}
    </>
  );

  if ("href" in props && props.href) {
    const { href, external } = props;
    const cls = cn(baseClass, variantClass[variant], sizeClass[size], className);
    if (external) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={cls}
      >
        {inner}
      </Link>
    );
  }

  const { variant: _v, size: _s, arrow: _a, className: _c, children: _ch, href: _h, ...rest } =
    props as ButtonProps;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={cn(baseClass, variantClass[variant], sizeClass[size], className)}
      {...rest}
    >
      {inner}
    </button>
  );
});
