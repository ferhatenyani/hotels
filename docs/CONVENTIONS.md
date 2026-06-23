# Hotel-project conventions

> One source of truth for spawned page-builder agents. Read this before writing a single line.
> If a page violates a rule here, the orchestrator will send it back.

## 0. Hard constraints (non-negotiable)

1. **Next.js 16 specifics.** `params` and `searchParams` are now `Promise`s — always `await` them in Server Components.
   - Use the global helper `PageProps<'/path/[slug]'>` for `page.tsx` typings. Don't import — it's global.
   - Use `LayoutProps<'/path'>` for layouts.
   - Dynamic routes get `loading.tsx` for streaming partial prefetch.
2. **Server Components by default.** Add `"use client"` only when the file needs `useState`, `useEffect`, event handlers, or browser APIs.
3. **Mobile-first.** Author the smallest viewport first (≤320 px), then scale up with `sm: md: lg: xl:` prefixes. No `max-w-` desktop and shrink-down.
4. **Touch targets ≥ 44 px.** Use `min-h-[44px]` for any link/button that's mobile-relevant.
5. **No new dependencies** without good reason — everything you need is in `package.json`.
6. **Never break the existing site.** Do not edit `app/(site)/page.tsx` or any of the existing home-section components without explicit reason.

## 1. Routing

```
app/
  layout.tsx              ← root: html/body/fonts/SmoothScroll. Don't touch.
  (site)/
    layout.tsx            ← NavbarCentered + ChatModal + Footer wrap
    page.tsx              ← home (Hero + sections), DON'T EDIT
    rooms/page.tsx
    rooms/[slug]/page.tsx
    dining/page.tsx
    events/page.tsx
    discover-bejaia/page.tsx
    discover-bejaia/[slug]/page.tsx        (optional)
    gallery/page.tsx
    offers/page.tsx
    offers/[slug]/page.tsx                 (optional)
    about/page.tsx
    contact/page.tsx
    faq/page.tsx
    policies/page.tsx
  (booking)/
    layout.tsx            ← BookingHeader + StepRail + BookingFooter
    booking/search/page.tsx
    booking/results/page.tsx
    booking/guest/page.tsx
    booking/review/page.tsx
    booking/payment/page.tsx
    booking/confirmation/[ref]/page.tsx
    booking/lookup/page.tsx
  not-found.tsx           ← global 404 (file lives at app/not-found.tsx)
```

Route groups `(site)` and `(booking)` do not appear in URLs.

## 2. Design tokens (already in `app/globals.css`)

| Token | Value | Used for |
| --- | --- | --- |
| `--color-ink` | `#151316` | Body text, dark surfaces |
| `--color-cream` | `#e8e0d5` | Warm-page surface (Dining, Contact) |
| `--color-marine` | `#1f4a37` | Brand accent ("Lac Vert" forest green). Also aliased as `marine`/`navy`/`accent`. |
| `--color-graybase` | `#3d3d3d` | Body copy on cream/white |
| `--font-display` | Erode | Headings, prices, eyebrow numerals |
| `--font-sans` | Switzer | Body, UI, eyebrows |
| `--breakpoint-xs` | 30rem | Phone-large breakpoint |

**Utility classes already defined:**
- `.grain` → adds a subtle SVG noise overlay. Use on `cream` and `ink` toned sections.
- `.marquee-mask` / `.animate-marquee` → only on Exhibit; don't reuse elsewhere.
- `.scroll-dark` → slim ink scrollbar (use inside popovers).

## 3. Type scale & rhythm

| Role | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Section eyebrow | `text-[11px]` uppercase `tracking-[0.22em]` | same | same |
| Page hero H1 | `text-[32px]` `xs:text-[36px]` | `sm:text-5xl` | `lg:text-6xl` |
| Section H2 | `text-[28px]` `xs:text-[32px]` | `sm:text-4xl` | `lg:text-5xl` |
| Sub-heading H3 | `text-[20px]` `md:text-[24px]` | same | same |
| Body | `text-[15px]` leading `1.65–1.7` | `text-[16px]` leading `1.7–1.75` | same |
| Card/sub-body | `text-[14px]` | same | same |
| Small caps label | `text-[10px–10.5px]` uppercase `tracking-[0.18–0.24em]` | same | same |

**Headings are always `font-display font-medium tracking-tight` with `text-balance`.**

## 4. Spacing rhythm

Section vertical: `py-14 md:py-20 lg:py-[120px]` (default) or `py-10 md:py-14 lg:py-20` (compact).
Page side padding: `px-4 sm:px-6 lg:px-10`.
Container max width: `max-w-[1280px] mx-auto` (default), or `max-w-[920px]` (narrow editorial), `max-w-[1440px]` (wide gallery).

Use the **`Section` primitive** (`components/site/Section.tsx`) instead of restating the wrapper:

```tsx
<Section tone="cream" grain id="something" size="default">
  <SectionHeading eyebrow="…" heading="…" />
  …
</Section>
```

## 5. Reusable primitives — USE THESE, DO NOT REINVENT

| Import | Purpose |
| --- | --- |
| `import Section from "@/components/site/Section"` | Page-section wrapper (bg, padding, max-width, grain). |
| `import SectionHeading from "@/components/site/SectionHeading"` | Eyebrow + heading + marine hairline rule + optional description. |
| `import PageHero from "@/components/site/PageHero"` | Editorial hero used by every secondary route. |
| `import Breadcrumb from "@/components/site/Breadcrumb"` | Sub-route breadcrumb. |
| `import { Button } from "@/components/site/Button"` | Primary/secondary/ghost CTA. Renders Link if `href`, button otherwise. |
| `import { Field, TextArea } from "@/components/site/FormField"` | Letter-style form field (index + label + animated marine underline). |
| `import Stepper from "@/components/site/Stepper"` | The +/- guest counter. |
| `import RoomCard from "@/components/site/RoomCard"` | Standard room card; supports `variant="compact"` and price-quote overlay. |
| `import SmartLink from "@/components/site/SmartLink"` | Link that scrolls to `#section` on home, routes to `/section` elsewhere. |
| `import { Calendar } from "@/components/ui/calendar"` | shadcn day-picker calendar. |
| `import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"` | Popover primitives. |
| `import BottomSheet from "@/components/ui/bottom-sheet"` | Mobile drag-down sheet. Pattern: open → step → step → commit. |

**Footer + Navbar are already wired in `(site)/layout.tsx`. Don't repeat them on individual pages.**

## 6. Data layer — read from `lib/data/*`, don't hardcode

| File | Exports |
| --- | --- |
| `lib/data/hotel.ts` | `hotel` (name, address, contact, numbers, distances), `formatDA(n)` |
| `lib/data/rooms.ts` | `rooms`, `getRoomBySlug`, `getFeaturedRooms`, `getRoomsForParty`, `featureLabels`, `Room` type |
| `lib/data/experiences.ts` | `experiences`, `getExperienceBySlug`, `Experience` type |
| `lib/data/dining.ts` | `diningHours`, `diningMenu`, `diningHighlights` |
| `lib/data/events.ts` | `eventTypes`, `hallCapacity`, `meetingEquipment`, `eventTimeline` |
| `lib/data/offers.ts` | `offers`, `getOfferBySlug`, `getOfferByPromoCode`, `Offer` type |
| `lib/data/faq.ts` | `faqGroups`, `FAQItem`, `FAQGroup` |

## 7. Booking funnel — URL is the state

```ts
import {
  bookingHref,                       // build a href to a step preserving query
  bookingToSearchParams,             // serialize BookingQuery
  searchParamsToBooking,             // parse URLSearchParams → BookingQuery
  isSearchReady,                     // checkIn && checkOut && adults > 0
} from "@/lib/booking/params";

import type { BookingQuery, GuestDetails, PaymentDetails, AddOn } from "@/lib/booking/types";
import { addOns } from "@/lib/booking/types";

import { computeBreakdown, makeBookingRef } from "@/lib/booking/pricing";
```

**Pattern in funnel pages** (Server Component):

```tsx
import type { PageProps } from "next";
import { searchParamsToBooking } from "@/lib/booking/params";

export default async function Page(props: PageProps<'/booking/results'>) {
  const sp = await props.searchParams;
  const q = searchParamsToBooking(sp);
  // …
}
```

**Pattern in client subcomponents:**

```tsx
"use client";
import { useSearchParams } from "next/navigation";
import { searchParamsToBooking, bookingHref } from "@/lib/booking/params";

const sp = useSearchParams();
const q = searchParamsToBooking(sp);
```

**Pre-population:** if `?room=<slug>` is present, /booking/search and /booking/results lock the choice. The guest details / review / payment / confirmation steps require `roomSlug` + dates — if missing, redirect back to `/booking/search`.

## 8. Mobile-first reflow patterns

| Pattern | When | How |
| --- | --- | --- |
| Stack-to-grid | Card grids | Mobile: `flex flex-col gap-4` or single-col grid. Tablet: `md:grid md:grid-cols-2 md:gap-6`. Desktop: `lg:grid-cols-3 lg:gap-8`. |
| Horizontal scroll carousel | Mobile-only galleries / cards | `flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 pl-6 pr-4`, hide scrollbar with `[&::-webkit-scrollbar]:hidden`. See `Rooms.tsx` for the canonical impl + dot indicator. |
| Reorder content | Image+copy splits | Use `order-1 / order-2 lg:order-1 / lg:order-2` so the headline leads on mobile. |
| Sticky desktop sidebar | Booking review / room detail | `lg:sticky lg:top-24` inside a `lg:grid-cols-3` with `lg:col-span-2 + lg:col-span-1`. On mobile the sidebar becomes a sticky bottom action bar. |
| Bottom action bar | Mobile-only sticky CTA on long pages | `<div class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-ink/10 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">…</div>`. Reserve content space with `pb-24 md:pb-0`. |
| Multi-step bottom sheet | Mobile multi-input flows | Use the existing `BottomSheet` primitive (see `Hero.tsx` for the canonical 3-step pattern). |

**Hard responsiveness checklist** for every page:
- No horizontal scroll at 320 px width.
- Hero/headline doesn't clip at 360 px.
- All CTAs are ≥ 44 × 44 px on mobile.
- Forms switch to single column at ≤ 640 px.
- Tables/dense lists reflow to cards on mobile.
- `text-[16px]` minimum on input fields (avoids iOS auto-zoom).
- `min-h-dvh` (not `100vh`) for full-viewport sections.

## 9. Animation principles

- **GSAP** for scroll-triggered reveals (eyebrow → heading → rule cascade, parallax images, count-ups). Pattern: `gsap.context` inside a `useEffect`, with a `prefers-reduced-motion` early-return.
- **Framer Motion** for component-level state transitions (sheet open/close, chat FAB crossfade).
- **CSS transitions** for hover / focus / micro-state.
- **Duration:** 150–300 ms for micro-interactions; 400–700 ms for reveals.
- **Easing:** `expo.out` for reveals; `power2.out` for state changes.
- **Stagger:** 70–100 ms between siblings.
- Always respect `prefers-reduced-motion` — wrap motion in a check, return early, no animation.

## 10. Accessibility

- Use real `<button>` for actions, real `<a>`/`<Link>` for navigation.
- Every image has meaningful `alt`. Decorative images get `alt=""` + `aria-hidden`.
- Form inputs have visible labels (use `FormField` — it does this).
- Focus rings stay visible: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine`.
- Color is never the only signal — pair it with icon/text.
- `aria-current="page"` on the active nav item.
- Heading hierarchy: each route has one `<h1>` (the PageHero); section headings are `<h2>`.

## 11. Page archetype templates

### Editorial page (Dining, Events, About, Discover Béjaïa)
```
PageHero
Section (intro + key facts grid)
Section (image+copy split) × N — alternating layouts
Section (testimonial / quote block) [optional]
Section (CTA banner cross-linking another route)
```

### Listing page (Rooms, Offers, Gallery, Discover Béjaïa list)
```
PageHero (short height)
Section (filter bar — optional)
Section with grid of RoomCard / OfferCard / ExperienceCard
Section (cross-sell CTA banner)
```

### Detail page (room/[slug], offers/[slug])
```
PageHero (image-only or with breadcrumb)
Section with grid: 2-col on lg (gallery + meta), single col on mobile
  - Left: gallery, long description, amenities ledger
  - Right (sticky on lg, fixed bottom bar on mobile): price + book CTA
Section (related items rail)
```

### Booking funnel step (results / guest / review / payment)
```
(BookingHeader + StepRail already provided by layout)
Section narrow (max-w-[920px]) with the step's content
  Right column: persistent BookingSummary card (sticky on lg, expandable on mobile)
Sticky bottom action bar on mobile with the Continue CTA.
```

## 12. Reporting back

When you finish a page batch, your final message must include:
1. **Files created/edited** (paths only).
2. **What links to where** — list every Link/href so the orchestrator can verify the graph.
3. **Breakpoints tested** — confirm 320 / 375 / 640 / 768 / 1024 / 1440 visually pass.
4. **Anything you changed in shared files** (data, components, layouts).
5. **Open questions** — anything ambiguous you had to decide.
