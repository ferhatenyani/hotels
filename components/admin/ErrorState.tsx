import { AlertOctagon } from "lucide-react";

import { Button } from "./Button";

export function ErrorState({
  title = "Quelque chose n'a pas fonctionné",
  body,
  onRetry,
  retryLabel = "Réessayer",
}: {
  title?: React.ReactNode;
  body?: React.ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="inline-flex size-12 items-center justify-center rounded-[var(--radius-admin-lg)] bg-[var(--color-admin-danger-bg)] text-[var(--color-admin-danger-fg)]">
        <AlertOctagon className="size-5" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-[var(--color-admin-text)]">{title}</h3>
      {body ? (
        <p className="mt-1.5 max-w-sm text-[13px] leading-5 text-[var(--color-admin-muted)]">
          {body}
        </p>
      ) : null}
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-6" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
