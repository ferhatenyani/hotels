"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  onBack?: () => void;
  children: ReactNode;
  /** Sticky footer slot — typically a primary CTA. */
  footer?: ReactNode;
  /**
   * Max-height of the sheet as a dvh value. 0.92 by default, leaves a touch
   * of background visible so the modal context stays clear.
   */
  maxHeight?: number;
  /** Class for the body region (the scrollable area). */
  bodyClassName?: string;
};

export default function BottomSheet({
  open,
  onClose,
  title,
  onBack,
  children,
  footer,
  maxHeight = 0.92,
  bodyClassName,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  // Portal target only exists on the client; gate the portal until after
  // hydration so the server-rendered tree (null) matches the first client
  // render. The portal then appears via a state flip in a useEffect.
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => setPortalReady(true), []);

  // Drag offset while the user is pulling the handle down. While dragging,
  // an inline transform takes over and CSS transition is disabled so the
  // sheet tracks the finger 1:1. When the drag ends we clear both and the
  // Tailwind transition class drives the snap-back or close.
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Reset any stuck drag offset when the sheet closes from elsewhere.
  useEffect(() => {
    if (!open) {
      setDragging(false);
      setDragY(0);
    }
  }, [open]);

  // Drag-down-to-dismiss on the grab handle.
  useEffect(() => {
    const handle = dragHandleRef.current;
    if (!handle || !open) return;

    let startY = 0;
    let currentY = 0;
    let active = false;

    const onStart = (e: PointerEvent) => {
      active = true;
      startY = e.clientY;
      currentY = 0;
      setDragging(true);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!active) return;
      currentY = Math.max(0, e.clientY - startY);
      setDragY(currentY);
    };
    const onEnd = () => {
      if (!active) return;
      active = false;
      const dismiss = currentY > 120;
      setDragging(false);
      setDragY(0);
      if (dismiss) onClose();
    };

    handle.addEventListener("pointerdown", onStart);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    return () => {
      handle.removeEventListener("pointerdown", onStart);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };
  }, [open, onClose]);

  if (!portalReady || typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-x-0 top-0 h-[100dvh] z-[100]",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "absolute inset-0 bg-ink/45 transition-opacity duration-300 ease-out",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        style={{
          maxHeight: `${maxHeight * 100}dvh`,
          ...(dragging
            ? { transform: `translateY(${dragY}px)`, transition: "none" }
            : null),
        }}
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col rounded-t-[20px] bg-white shadow-[0_-20px_60px_-10px_rgba(21,19,22,0.35)] outline-none will-change-transform",
          "transition-transform duration-500 ease-out",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div
          ref={dragHandleRef}
          className="flex shrink-0 cursor-grab justify-center pt-2 pb-1 touch-none active:cursor-grabbing"
        >
          <span
            aria-hidden
            className="block h-1 w-9 rounded-full bg-ink/20"
          />
        </div>
        <header className="flex shrink-0 items-center justify-between gap-3 px-4 pb-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="flex h-11 w-11 -ml-2 items-center justify-center rounded-full text-ink/65 transition-colors hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
          ) : (
            <span className="h-11 w-11 -ml-2" aria-hidden />
          )}
          {title ? (
            <h2
              id={titleId}
              className="font-display text-[16px] font-medium tracking-tight text-ink"
            >
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 -mr-2 items-center justify-center rounded-full text-ink/65 transition-colors hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </header>

        <div
          data-lenis-prevent
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-4 pb-4",
            bodyClassName,
          )}
        >
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-ink/10 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
