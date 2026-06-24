# Aperture v2 — Apple-like Admin Redesign Brief

> **Read this before touching any admin file.** It is the single source of
> truth for the visual redesign. All tokens live in `app/globals.css` under
> the `@theme` block and the `.admin-shell` scope. **Never hardcode a colour,
> radius, shadow, or font** — read from the tokens below. If a token is
> missing, raise it in your report; do not invent a local value.
>
> Pair this with `docs/ADMIN-CONVENTIONS.md` (routing, primitives, repo, auth,
> French-only UI copy). Those rules still hold. This file governs the *look*.

---

## 0. Direction

Clean, confident, **Apple-like**. Think macOS System Settings / iOS: SF Pro
typography, generous whitespace, subtle layered depth, restrained colour,
crisp hierarchy. Every screen should feel like it belongs in macOS — refined,
spacious, purposeful. Nothing decorative for its own sake.

- **Neutral base**: whites, Apple system grays, near-black ink.
- **One accent**: Lac Vert marine green (`--color-admin-accent`). Used for
  primary actions, current selection, focus, active nav — **never decoration**.
- **No gradients. No glassmorphism by default. No side-stripe borders. No
  gradient text.** (See the absolute bans in §7.)

The guest site is **off-limits** — `app/(site)/*`, `app/(booking)/*`,
`components/site/*`, `components/booking/*`, and the shared guest tokens
(`--color-cream`, Switzer/Erode fonts, body weight 600). Our changes are
namespaced under `.admin-shell`; do not alter anything outside admin scope.

---

## 1. Tokens (read these, never hardcode)

### Colour — neutrals
| Token | Use |
| --- | --- |
| `--color-admin-bg` `#f5f5f7` | App canvas behind panels |
| `--color-admin-panel` `#ffffff` | Cards, tables, forms, surfaces |
| `--color-admin-sunken` `#efeff1` | Table headers, secondary zones, hover fills |
| `--color-admin-border` `#e4e4e7` | Hairline borders, separators |
| `--color-admin-border-strong` `#cdcdd2` | Active / passive-focus borders |
| `--color-admin-divider` `#ededf0` | Internal horizontal rules |
| `--color-admin-text` `#1d1d1f` | Primary ink |
| `--color-admin-muted` `#62626a` | Secondary text (≥4.5:1 on white) |
| `--color-admin-faint` `#8e8e96` | Tertiary text, placeholders |

### Colour — accent (single hue)
| Token | Use |
| --- | --- |
| `--color-admin-accent` `#1f4a37` | Primary buttons, links, active state |
| `--color-admin-accent-hover` | Hover on accent surfaces |
| `--color-admin-accent-press` | Active/pressed on accent surfaces |
| `--color-admin-accent-soft` `#eaf1ed` | Tinted accent surface (selected row, active nav) |
| `--color-admin-accent-ring` | Focus ring colour |

Prefer the Tailwind utility `bg-marine` / `text-marine` only where it already
maps to the accent; new code should reference `--color-admin-accent*`.

### Colour — status (always `bg`+`fg` together, + icon + label)
`ok`, `warn`, `danger`, `info`, `muted`, `violet`, `amber`, `solid` →
`--color-admin-{tone}-bg` / `--color-admin-{tone}-fg`. Status→tone→icon
mapping is in `components/admin/tone.ts` and `ADMIN-CONVENTIONS.md §2.2`.
**Never** signal status by colour alone.

### Typography
- Family: `--font-admin` (SF Pro → -apple-system → BlinkMacSystemFont →
  Inter → system-ui). Applied at `.admin-shell` root — children inherit;
  do **not** add `font-sans` (that's the guest Switzer).
- Body weight **400**; medium **500** for labels/emphasis; semibold **600**
  for headings and KPI values. Weight carries hierarchy, not size alone.
- Fixed px/rem scale (product UI — **no fluid clamp() headings**). Scale:

| Role | Size / line | Weight |
| --- | --- | --- |
| KPI value | `text-[28px] leading-8` + `tnum` | 600 |
| Page H1 (`PageHeader`) | `text-[21px] leading-7` | 600, `tracking-tight` |
| Section H2 | `text-[15px] leading-6` | 600 |
| Card title | `text-[14px] leading-5` | 600 |
| KPI / eyebrow label | `text-[11px] uppercase tracking-[0.06em]` | 500, `text-admin-muted` |
| Body | `text-[14px] leading-5` | 400 |
| Table dense | `text-[13px] leading-[18px]` | 400 |
| Meta / timestamp | `text-[12px]` + `text-admin-muted tnum` | 400 |
| Input (mobile ≥16px to avoid iOS zoom) | `text-[14px]` desktop / `text-[16px]` mobile | 400 |

Always `tnum` for prices, counts, dates, durations, %, room/reservation IDs.

### Spacing & radius
- Spacing scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48. Vary it for rhythm —
  don't pad everything identically.
- Panel padding: `p-5` desktop, `p-4` mobile. Card gap: `gap-4` (lists),
  `gap-6` (dashboards).
- Radius tokens: `--radius-admin-sm` (7px badges/controls),
  `--radius-admin-md` (9px buttons/inputs), `--radius-admin-lg` (13px cards),
  `--radius-admin-xl` (18px modals/sheets), `--radius-admin-full` (pills).
  Use `rounded-[var(--radius-admin-md)]` etc. **Consistent radii everywhere.**

### Elevation (soft, layered)
- `--shadow-admin-sm` cards · `--shadow-admin-md` popovers/menus ·
  `--shadow-admin-lg` modals/sheets · `--shadow-admin-pop` dropdowns.
- Tables rely on hairline borders, **not** shadow. Don't stack heavy shadows.

### Focus & motion
- Focus: `.admin-ring` utility (soft accent halo) or
  `focus-visible:outline-2 focus-visible:outline-offset-2` with the accent.
  Every interactive element needs a visible `focus-visible` state.
- Motion: 150–220ms `ease-out` micro-interactions; sheets/drawers 220ms
  `cubic-bezier(0.22,1,0.36,1)`. Motion conveys **state**, not decoration.
  No stagger-for-its-own-sake, no parallax, no marquee. `prefers-reduced-motion`
  is already handled globally — keep transforms/opacity behind it.

### Z-index (semantic — never 999/9999)
`--z-admin-sidebar/sticky/dropdown/overlay/modal/toast/tooltip`.

---

## 2. Component states (non-negotiable)

Every interactive primitive ships **default · hover · focus-visible · active ·
disabled · loading** (where applicable). Every data surface ships
**loading (skeleton, not a centred spinner) · empty (teaches the screen) ·
error**. No blank white screen on load.

---

## 3. Responsiveness — mobile-first, structural

Layouts must **reflow and restructure** per viewport, not merely shrink.
Verify at **≤320, 360, 768, 1024, 1280, 1440**.

- Sidebar: full rail on desktop; off-canvas drawer on mobile/tablet.
- Tables: never a tiny horizontal-scroll mess on phones — collapse to stacked
  cards or a priority-column layout below `md`.
- Toolbars/filters: wrap or collapse into a menu; primary CTA stays reachable.
- Touch targets ≥ 44px on mobile. Inputs ≥16px font on mobile (no iOS zoom).

Desktop is the primary working surface (reception desk), but tablet must be
fully functional and phone must be usable for read/triage.

---

## 4. The loop (run per file/surface)

1. **Implement** with shared primitives + Aperture v2 tokens.
2. **Self-review** against this brief: Apple-like feel? tokens only (zero
   invented colour/radius/shadow)? all states present? French-only copy?
3. **Fix** until it passes.
4. **Verify responsiveness** at the breakpoints above (reason through the
   layout; restructure where it would break).
5. Done when all three pass and it visually matches sibling surfaces.

---

## 5. The Apple-like checklist (self-review)

- [ ] System font, 400 body, clear weight contrast on headings/values.
- [ ] One accent only; neutrals everywhere else; no gradient/decoration.
- [ ] Generous whitespace; varied spacing rhythm; not cramped, not bloated.
- [ ] Hairline borders + soft shadows; consistent radii from tokens.
- [ ] Crisp hierarchy: the eye lands on the right thing first.
- [ ] Body text ≥4.5:1 contrast; placeholders too (not faint-gray-on-tint).
- [ ] All interaction states + loading/empty/error present.
- [ ] Reflows structurally at every breakpoint; ≥44px touch targets.
- [ ] French-only UI copy, calm and precise.

## 6. Restraint — don't over-design

This is **product UI**: the tool disappears into the task. Earned familiarity
beats novelty. No invented affordances for standard tasks, no display fonts in
labels/buttons/data, no decorative motion. Cards are not the lazy default —
nested cards are always wrong. Modal is not the first thought — exhaust inline
/ sheet alternatives.

## 7. Absolute bans

- Side-stripe borders (`border-left`/`right` >1px as a coloured accent).
- Gradient text (`background-clip:text` + gradient).
- Glassmorphism as a default decorative move.
- The hero-metric template (big number + gradient accent SaaS cliché).
- Identical icon+heading+text card grids repeated endlessly.
- Uppercase tracked eyebrow on *every* section by reflex.
- Text that overflows its container at any breakpoint.
- Any colour/radius/shadow/font literal that bypasses the tokens above.
