// Helpers de formatage français pour tout l'admin. Toujours `fr-FR`.

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateLongFmt = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const timeFmt = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

const relFmt = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });

export function fmtDate(input: string | Date | undefined | null): string {
  if (!input) return "—";
  return dateFmt.format(new Date(input));
}

export function fmtDateLong(input: string | Date | undefined | null): string {
  if (!input) return "—";
  return dateLongFmt.format(new Date(input));
}

export function fmtDateTime(input: string | Date | undefined | null): string {
  if (!input) return "—";
  return dateTimeFmt.format(new Date(input));
}

export function fmtTime(input: string | Date | undefined | null): string {
  if (!input) return "—";
  return timeFmt.format(new Date(input));
}

/** « il y a 3 h », « dans 12 min », « hier », etc. */
export function fmtRelative(input: string | Date | undefined | null): string {
  if (!input) return "—";
  const target = new Date(input).getTime();
  const diffSec = Math.round((target - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return relFmt.format(diffSec, "second");
  if (abs < 3600) return relFmt.format(Math.round(diffSec / 60), "minute");
  if (abs < 86_400) return relFmt.format(Math.round(diffSec / 3600), "hour");
  if (abs < 2_592_000) return relFmt.format(Math.round(diffSec / 86_400), "day");
  if (abs < 31_536_000) return relFmt.format(Math.round(diffSec / 2_592_000), "month");
  return relFmt.format(Math.round(diffSec / 31_536_000), "year");
}

export function fmtDA(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return "—";
  return `${amount.toLocaleString("fr-FR")} DA`;
}

export function fmtPct(value: number | undefined | null, fractionDigits = 1): string {
  if (value === undefined || value === null) return "—";
  return `${value.toLocaleString("fr-FR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })} %`;
}

export function fmtNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return "—";
  return value.toLocaleString("fr-FR");
}

/** Joint un prénom et un nom proprement. */
export function fmtName(first?: string, last?: string): string {
  return [first, last].filter(Boolean).join(" ").trim() || "—";
}

/** Initiales pour un AvatarChip. */
export function initials(first?: string, last?: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "—";
}
