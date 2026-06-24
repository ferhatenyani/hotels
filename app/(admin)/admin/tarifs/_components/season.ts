// Mapping local : saison → tone du Badge. Aligné sur le brief :
// basse=info, moyenne=ok, haute=warn, tres-haute=danger.

import type { Tone } from "@/components/admin/tone";
import type { Season } from "@/lib/admin/types";

export const seasonTone: Record<Season, Tone> = {
  basse: "info",
  moyenne: "ok",
  haute: "warn",
  "tres-haute": "danger",
};

/** Couleur de fond utilisée par la vue calendrier (cellule de jour). */
export const seasonDayBg: Record<Season, string> = {
  basse: "bg-[var(--color-admin-info-bg)] text-[var(--color-admin-info-fg)]",
  moyenne: "bg-[var(--color-admin-ok-bg)] text-[var(--color-admin-ok-fg)]",
  haute: "bg-[var(--color-admin-warn-bg)] text-[var(--color-admin-warn-fg)]",
  "tres-haute":
    "bg-[var(--color-admin-danger-bg)] text-[var(--color-admin-danger-fg)]",
};
