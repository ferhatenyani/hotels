// "Smart" link that supports the user's chosen nav behaviour:
//  - From the home page, a target like "/rooms" should scroll to #rooms
//    (preserving the buttery on-page smooth scroll the home already has)
//  - From any other route, the same link routes to /rooms
//
// Pattern: pass `href="/rooms"` and `sectionId="rooms"` — the component
// decides at click time which behaviour to use based on the current pathname.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from "react";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  /** When provided, on home page we scroll to #sectionId instead of navigating. */
  sectionId?: string;
  /** Called after click — useful for closing the mobile menu. */
  onAfterClick?: () => void;
  children: React.ReactNode;
};

const HOME_SCROLLABLE_IDS = new Set([
  "rooms",
  "dining",
  "events",
  "exhibit",
  "about",
  "contact",
  "top",
]);

const SmartLink = forwardRef<HTMLAnchorElement, Props>(function SmartLink(
  { href, sectionId, onAfterClick, onClick, children, ...rest },
  ref,
) {
  const pathname = usePathname();
  const onHome = pathname === "/";

  const id = sectionId ?? (href.startsWith("/") ? href.slice(1) : undefined);
  const canScroll = onHome && id && HOME_SCROLLABLE_IDS.has(id);

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (!canScroll || e.defaultPrevented) {
      onAfterClick?.();
      return;
    }
    const target = document.getElementById(id!);
    if (!target) {
      onAfterClick?.();
      return;
    }
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    // Keep URL consistent so a copied link still lands on the same section.
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
    onAfterClick?.();
  };

  return (
    <Link
      ref={ref}
      href={canScroll ? `#${id}` : href}
      onClick={handle}
      {...rest}
    >
      {children}
    </Link>
  );
});

export default SmartLink;
