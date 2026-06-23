// URL-param helpers for the booking funnel. The funnel state lives in the URL
// so refresh, back button, deep-linking and link-sharing all "just work" —
// nothing is stored on the server or in localStorage.
//
// Date format: YYYY-MM-DD (ISO day, no timezone). Stored that way to keep the
// URL human-readable: /booking/results?in=2026-07-04&out=2026-07-07&adults=2.

import { format, isValid, parseISO } from "date-fns";

import type { BookingQuery } from "./types";

export const DATE_FMT = "yyyy-MM-dd";

export function encodeDate(d: Date | undefined): string | undefined {
  if (!d || !isValid(d)) return undefined;
  return format(d, DATE_FMT);
}

export function decodeDate(s: string | null | undefined): Date | undefined {
  if (!s) return undefined;
  const d = parseISO(s);
  return isValid(d) ? d : undefined;
}

/**
 * Build a URLSearchParams from a partial booking query. Undefined / empty
 * values are dropped so the URL stays clean.
 */
export function bookingToSearchParams(
  q: Partial<BookingQuery>,
): URLSearchParams {
  const out = new URLSearchParams();
  const cin = encodeDate(q.checkIn);
  const cout = encodeDate(q.checkOut);
  if (cin) out.set("in", cin);
  if (cout) out.set("out", cout);
  if (q.adults && q.adults > 0) out.set("adults", String(q.adults));
  if (q.children && q.children > 0) out.set("children", String(q.children));
  if (q.roomSlug) out.set("room", q.roomSlug);
  if (q.promo) out.set("promo", q.promo.trim().toUpperCase());
  return out;
}

/**
 * Read a booking query from a plain Record (the shape Next gives via
 * `await searchParams` or `Object.fromEntries(useSearchParams())`).
 */
export function searchParamsToBooking(
  raw: Record<string, string | string[] | undefined> | URLSearchParams,
): BookingQuery {
  const get = (k: string): string | undefined => {
    if (raw instanceof URLSearchParams) return raw.get(k) ?? undefined;
    const v = raw[k];
    if (Array.isArray(v)) return v[0];
    return v;
  };

  const adultsRaw = Number(get("adults") ?? 2);
  const childrenRaw = Number(get("children") ?? 0);

  return {
    checkIn: decodeDate(get("in")),
    checkOut: decodeDate(get("out")),
    adults: Number.isFinite(adultsRaw) && adultsRaw > 0 ? adultsRaw : 2,
    children:
      Number.isFinite(childrenRaw) && childrenRaw >= 0 ? childrenRaw : 0,
    roomSlug: get("room"),
    promo: get("promo")?.toUpperCase(),
  };
}

/** Build a /booking/<step> URL preserving the current query. */
export function bookingHref(
  step:
    | "search"
    | "results"
    | "guest"
    | "review"
    | "payment"
    | "confirmation"
    | "lookup",
  q: Partial<BookingQuery>,
  /** For /booking/confirmation/[ref]. */
  ref?: string,
): string {
  const params = bookingToSearchParams(q);
  const qs = params.toString();
  const path =
    step === "confirmation" && ref
      ? `/booking/confirmation/${encodeURIComponent(ref)}`
      : `/booking/${step}`;
  return qs ? `${path}?${qs}` : path;
}

/**
 * Whether the query is "search-ready" — has dates and at least one adult.
 * Used to decide whether to skip /booking/search and jump to /booking/results.
 */
export function isSearchReady(q: BookingQuery): boolean {
  return Boolean(
    q.checkIn && q.checkOut && q.checkIn < q.checkOut && q.adults > 0,
  );
}
