"use client";

import Link from "next/link";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  /** Icône Lucide à gauche du libellé. Passe `<Icon className="size-4" />`. */
  leftIcon?: React.ReactNode;
  /** Icône Lucide à droite du libellé. */
  rightIcon?: React.ReactNode;
  /** Affiche un spinner et désactive le bouton. */
  loading?: boolean;
  /** Texte affiché pendant le chargement (par défaut : libellé d'origine). */
  loadingLabel?: string;
  className?: string;
  children?: React.ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-tight whitespace-nowrap " +
  "rounded-md transition-[background-color,color,border-color,box-shadow] duration-150 ease-out " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-marine text-white shadow-sm hover:bg-[#163a2b] active:bg-[#0f2c20]",
  secondary:
    "bg-[var(--color-admin-panel)] text-[var(--color-admin-text)] " +
    "shadow-[inset_0_0_0_1px_var(--color-admin-border-strong)] " +
    "hover:bg-[var(--color-admin-sunken)]",
  ghost:
    "bg-transparent text-[var(--color-admin-text)] hover:bg-[var(--color-admin-sunken)]",
  subtle:
    "bg-[var(--color-admin-sunken)] text-[var(--color-admin-text)] hover:bg-[var(--color-admin-border)]",
  danger:
    "bg-[var(--color-admin-danger-fg)] text-white shadow-sm hover:bg-[#5d1313]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[12.5px]",
  md: "h-9 px-3.5 text-[13.5px]",
  lg: "h-11 px-5 text-[14px]",
};

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
    /** Ouvre en nouvel onglet. */
    external?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function Spinner({ size }: { size: Size }) {
  const px = size === "sm" ? 12 : size === "lg" ? 16 : 14;
  return (
    <svg
      className="animate-spin"
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const {
      variant = "secondary",
      size = "md",
      leftIcon,
      rightIcon,
      loading,
      loadingLabel,
      className,
      children,
      ...rest
    } = props;

    const content = (
      <>
        {loading ? <Spinner size={size} /> : leftIcon}
        <span className="truncate">{loading && loadingLabel ? loadingLabel : children}</span>
        {!loading && rightIcon}
      </>
    );

    const merged = cn(base, variants[variant], sizes[size], className);

    if ("href" in props && props.href !== undefined) {
      const { href, external, ...anchorRest } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement> & {
        external?: boolean;
      };
      if (external) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={merged}
            {...anchorRest}
          >
            {content}
          </a>
        );
      }
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={props.href}
          className={merged}
          {...(anchorRest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={merged}
        disabled={loading || (rest as React.ButtonHTMLAttributes<HTMLButtonElement>).disabled}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  },
);

export type IconButtonProps = Omit<CommonProps, "leftIcon" | "rightIcon" | "children"> &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
    icon: React.ReactNode;
    /** Obligatoire : libellé français lu par les lecteurs d'écran. */
    "aria-label": string;
  };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ variant = "ghost", size = "md", icon, className, ...rest }, ref) {
    const square = size === "sm" ? "size-8" : size === "lg" ? "size-11" : "size-9";
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], square, "px-0", className)}
        {...rest}
      >
        {icon}
      </button>
    );
  },
);
