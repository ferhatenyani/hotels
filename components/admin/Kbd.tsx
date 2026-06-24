import { cn } from "@/lib/utils";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-5 items-center justify-center h-5 px-1.5",
        "rounded-[var(--radius-admin-sm)] text-[10.5px] font-medium leading-none",
        "bg-[var(--color-admin-panel)] text-[var(--color-admin-muted)]",
        "shadow-[inset_0_0_0_1px_var(--color-admin-border-strong),var(--shadow-admin-xs)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
