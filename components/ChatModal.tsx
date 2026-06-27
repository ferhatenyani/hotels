"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { MessageCircle, Send, X } from "lucide-react";

export default function ChatModal() {
  const [open, setOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const isMobileRef = useRef(false);

  // One-time side effect: inject the dot-pulse keyframes. Scoped via a
  // data-attribute so we never inject twice if the component remounts.
  useEffect(() => {
    if (!document.querySelector("style[data-chat-keyframes]")) {
      const style = document.createElement("style");
      style.setAttribute("data-chat-keyframes", "true");
      style.textContent = `
        @keyframes chat-typing-dot {
          0%, 60%, 100% { opacity: 0.28; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-2px); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Initial paint: modal hidden off-screen so the first open animation has
  // somewhere to come from. We set this synchronously to avoid a flash.
  useLayoutEffect(() => {
    if (!modalRef.current) return;
    isMobileRef.current = window.matchMedia("(max-width: 767px)").matches;
    gsap.set(modalRef.current, {
      opacity: 0,
      scale: isMobileRef.current ? 1 : 0,
      y: isMobileRef.current ? "100%" : 0,
      transformOrigin: "100% 100%",
      pointerEvents: "none",
    });
    if (backdropRef.current) {
      gsap.set(backdropRef.current, { opacity: 0, pointerEvents: "none" });
    }
  }, []);

  // Open / close transitions. Desktop morphs from the button's corner via a
  // scale-from-bottom-right; mobile slides up as a full-height sheet. The
  // button shrinks toward the same anchor so the two feel like one element.
  useLayoutEffect(() => {
    if (!modalRef.current || !buttonRef.current) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    isMobileRef.current = isMobile;

    const ctx = gsap.context(() => {
      if (open) {
        gsap.set(modalRef.current, { pointerEvents: "auto" });
        if (backdropRef.current && !isMobile) {
          gsap.set(backdropRef.current, { pointerEvents: "auto" });
          gsap.to(backdropRef.current, {
            opacity: 1,
            duration: prefersReduced ? 0.01 : 0.3,
            ease: "power2.out",
          });
        }
        if (isMobile) {
          gsap.fromTo(
            modalRef.current,
            { y: "100%", opacity: 1, scale: 1 },
            {
              y: "0%",
              duration: prefersReduced ? 0.01 : 0.55,
              ease: "power3.out",
            },
          );
        } else {
          gsap.fromTo(
            modalRef.current,
            {
              scale: 0,
              opacity: 0,
              transformOrigin: "100% 100%",
            },
            {
              scale: 1,
              opacity: 1,
              duration: prefersReduced ? 0.01 : 0.6,
              ease: "back.out(1.4)",
            },
          );
        }
        gsap.to(buttonRef.current, {
          scale: 0,
          opacity: 0,
          duration: prefersReduced ? 0.01 : 0.3,
          ease: "power2.in",
          transformOrigin: "100% 100%",
        });
      } else {
        if (backdropRef.current) {
          gsap.to(backdropRef.current, {
            opacity: 0,
            duration: prefersReduced ? 0.01 : 0.25,
            ease: "power2.in",
            onComplete: () => {
              if (backdropRef.current) {
                gsap.set(backdropRef.current, { pointerEvents: "none" });
              }
            },
          });
        }
        if (isMobile) {
          gsap.to(modalRef.current, {
            y: "100%",
            duration: prefersReduced ? 0.01 : 0.55,
            ease: "power3.inOut",
            onComplete: () => {
              if (modalRef.current) {
                gsap.set(modalRef.current, { pointerEvents: "none" });
              }
            },
          });
        } else {
          gsap.to(modalRef.current, {
            scale: 0,
            opacity: 0,
            duration: prefersReduced ? 0.01 : 0.6,
            ease: "back.in(1.4)",
            transformOrigin: "100% 100%",
            onComplete: () => {
              if (modalRef.current) {
                gsap.set(modalRef.current, { pointerEvents: "none" });
              }
            },
          });
        }
        gsap.to(buttonRef.current, {
          scale: 1,
          opacity: 1,
          duration: prefersReduced ? 0.01 : 0.45,
          delay: prefersReduced ? 0 : 0.2,
          ease: "back.out(1.5)",
          transformOrigin: "100% 100%",
        });
      }
    });

    return () => ctx.revert();
  }, [open]);

  // Esc-to-close. Cheap accessibility win — nothing fancier needed for a
  // visual demo.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // External components (e.g. the mobile chat pill inside Hero) open the
  // concierge by dispatching a "concierge:open" event — decouples them from
  // this component's internal state.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("concierge:open", onOpen);
    return () => window.removeEventListener("concierge:open", onOpen);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {/* Chat trigger is now owned by Hero across all breakpoints (a pill
          that crossfades to a docked FAB on scroll). This button stays in
          the DOM so the open/close animations still have a valid ref to
          animate, but it's never visible. */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir la conciergerie"
        aria-expanded={open}
        aria-hidden="true"
        tabIndex={-1}
        style={{
          bottom: "max(1rem, env(safe-area-inset-bottom))",
          right: "max(1rem, env(safe-area-inset-right))",
        }}
        className="hidden fixed z-[80] h-14 w-14 items-center justify-center rounded-full border border-ink/20 bg-white text-ink"
      >
        <MessageCircle className="h-[22px] w-[22px]" strokeWidth={1.6} />
      </button>

      <div
        ref={backdropRef}
        onClick={close}
        aria-hidden
        style={{ opacity: 0, pointerEvents: "none" }}
        className="fixed inset-0 z-[85] bg-ink/[0.04] max-md:hidden"
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Conciergerie"
        style={{ opacity: 0, pointerEvents: "none" }}
        className="fixed z-[90] flex flex-col overflow-hidden bg-white border border-ink/15
                   bottom-6 right-6 w-[380px] h-[520px] rounded-[12px]
                   max-md:inset-0 max-md:bottom-0 max-md:right-0 max-md:left-0 max-md:top-0
                   max-md:h-[100dvh] max-md:w-screen max-md:rounded-none max-md:border-0"
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-ink/10 shrink-0 max-md:pt-[max(1rem,env(safe-area-inset-top))]">
          <span
            className="font-display text-[16px] font-medium tracking-tight text-ink"
          >
            Conciergerie
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer la conversation"
            className="flex h-9 w-9 max-md:h-11 max-md:w-11 items-center justify-center rounded-[8px] text-ink/55 transition-colors hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </header>

        <div
          data-lenis-prevent
          className="scroll-dark flex-1 min-h-0 overflow-y-auto px-5 py-5"
        >
          <div className="flex flex-col gap-4">
            <Bubble side="bot">
              Bienvenue à la conciergerie. Comment pouvons-nous vous aider ?
            </Bubble>

            <div className="flex flex-col gap-2 pl-1">
              <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-ink/45">
                Suggestions
              </p>
              <ul className="flex flex-wrap gap-2">
                {[
                  "Réserver une chambre",
                  "Voir les offres",
                  "Nous contacter",
                ].map((chip) => (
                  <li key={chip}>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full border border-ink/15 bg-white px-3.5 py-2 min-h-[36px] text-[13px] font-medium text-ink transition-colors hover:border-marine/50 hover:bg-marine/[0.06] hover:text-marine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {chip}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center gap-2 border-t border-ink/10 px-3 py-3 bg-white shrink-0 max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <input
            type="text"
            placeholder="Écrivez un message..."
            aria-label="Message"
            className="h-10 max-md:h-11 flex-1 rounded-[8px] border border-transparent bg-ink/[0.04] px-3 text-[13px] max-md:text-[16px] font-medium text-ink placeholder:text-ink/45 outline-none transition-colors focus:border-ink/20 focus:bg-white"
            style={{ fontFamily: "var(--font-sans)" }}
          />
          <button
            type="submit"
            aria-label="Envoyer le message"
            className="flex h-10 w-10 max-md:h-11 max-md:w-11 shrink-0 items-center justify-center rounded-[8px] bg-marine text-white transition-colors hover:bg-marine/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
          >
            <Send className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </form>
      </div>
    </>
  );
}

function Bubble({
  side,
  children,
}: {
  side: "bot" | "user";
  children: React.ReactNode;
}) {
  const isBot = side === "bot";
  return (
    <li className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[78%] px-4 py-2.5 text-[13px] leading-[1.5] font-medium ${
          isBot
            ? "rounded-[12px] rounded-bl-[3px] bg-ink/[0.06] text-ink"
            : "rounded-[12px] rounded-br-[3px] bg-marine text-white"
        }`}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {children}
      </div>
    </li>
  );
}
