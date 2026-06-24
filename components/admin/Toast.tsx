"use client";

import { AlertOctagon, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

import { toneFill, type Tone } from "./tone";

export type ToastInput = {
  id?: string;
  tone?: Tone;
  title: string;
  body?: string;
  /** Durée d'auto-fermeture en ms. Par défaut 4000. */
  duration?: number;
};

type Toast = Required<Pick<ToastInput, "id" | "title">> & ToastInput;

type Ctx = {
  push: (t: ToastInput) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // On ne monte le portail qu'après l'hydratation. Sinon le serveur rend
  // « rien » et le client rend « le conteneur », ce qui déclenche un
  // mismatch d'hydratation détecté par React.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const push: Ctx["push"] = (input) => {
    const id = input.id ?? Math.random().toString(36).slice(2, 9);
    const t: Toast = { ...input, id, title: input.title };
    setToasts((curr) => [...curr, t]);
    const dur = input.duration ?? 4000;
    if (dur > 0) {
      setTimeout(() => {
        setToasts((curr) => curr.filter((x) => x.id !== id));
      }, dur);
    }
  };

  const dismiss: Ctx["dismiss"] = (id) =>
    setToasts((curr) => curr.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      {mounted
        ? createPortal(
            <div
              className="pointer-events-none fixed inset-x-4 top-4 flex flex-col items-end gap-2.5 sm:left-auto sm:right-4"
              style={{ zIndex: "var(--z-admin-toast)" }}
              role="region"
              aria-label="Notifications"
            >
              {toasts.map((t) => (
                <ToastBubble key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast(): Ctx {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être appelé sous <ToastProvider>.");
  return ctx;
}

function ToastBubble({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    const dur = toast.duration ?? 4000;
    if (dur <= 0) return;
    const t = setTimeout(() => setClosing(true), dur - 150);
    return () => clearTimeout(t);
  }, [toast.duration]);

  const Icon =
    toast.tone === "danger"
      ? AlertOctagon
      : toast.tone === "ok"
        ? CheckCircle2
        : toast.tone === "warn" || toast.tone === "amber"
          ? AlertTriangle
          : Info;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm gap-3 rounded-[var(--radius-admin-lg)] p-3.5 pr-2.5",
        "bg-[var(--color-admin-panel)] shadow-[var(--shadow-admin-lg)] ring-1 ring-[var(--color-admin-border)]",
        "animate-in fade-in slide-in-from-top-2 duration-200",
        closing && "animate-out fade-out slide-out-to-top-2",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-admin-md)]",
          toneFill[toast.tone ?? "info"],
        )}
      >
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium leading-5 text-[var(--color-admin-text)]">
          {toast.title}
        </p>
        {toast.body ? (
          <p className="mt-0.5 text-[12.5px] leading-5 text-[var(--color-admin-muted)]">
            {toast.body}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Fermer"
        onClick={onDismiss}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-admin-md)] text-[var(--color-admin-faint)] transition-colors hover:bg-[var(--color-admin-sunken)] hover:text-[var(--color-admin-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-admin-accent-ring)]"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
