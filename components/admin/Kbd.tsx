import { cn } from "@/lib/utils";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center h-5 px-1.5 rounded text-[10.5px] font-medium",
        "bg-[var(--color-admin-sunken)] text-[var(--color-admin-muted)]",
        "ring-1 ring-inset ring-[var(--color-admin-border)] font-sans",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
