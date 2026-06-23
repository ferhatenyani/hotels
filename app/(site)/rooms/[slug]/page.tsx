// /rooms/[slug] — the room detail page. Server Component.
//
// Archetype: Detail page (CONVENTIONS §11).
//   PageHero (room cover, with breadcrumb)
//   Section · 2-col on lg, single col on mobile
//     LEFT (lg:col-span-2): gallery → long description → amenities ledger → "best for" chips
//     RIGHT (lg:col-span-1, sticky): BookThisRoom (collapses to bottom action bar on mobile)
//   Section · related rooms rail (RoomCard variant="compact")

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageHero from "@/components/site/PageHero";
import Section from "@/components/site/Section";
import Breadcrumb from "@/components/site/Breadcrumb";
import RoomCard from "@/components/site/RoomCard";
import { Button } from "@/components/site/Button";

import {
  rooms,
  getRoomBySlug,
  featureLabels,
  type RoomFeature,
} from "@/lib/data/rooms";
import { formatDA, hotel } from "@/lib/data/hotel";
import { searchParamsToBooking } from "@/lib/booking/params";

import RoomGallery from "./RoomGallery";
import BookThisRoom from "./BookThisRoom";

// Pre-render every room slug at build time. New rooms get added via the data
// file, so generating from the catalogue keeps this in lock-step.
export function generateStaticParams() {
  return rooms.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata(
  props: PageProps<"/rooms/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const room = getRoomBySlug(slug);
  if (!room) {
    return {
      title: "Room not found — Hôtel du Lac",
    };
  }
  return {
    title: `${room.name} — Hôtel du Lac, Béjaïa`,
    description: room.tagline,
    openGraph: {
      title: `${room.name} — Hôtel du Lac`,
      description: room.tagline,
      images: [{ url: room.cover, alt: room.coverAlt }],
    },
  };
}

export default async function RoomDetailPage(
  props: PageProps<"/rooms/[slug]">,
) {
  const { slug } = await props.params;
  const room = getRoomBySlug(slug);
  if (!room) notFound();

  const sp = await props.searchParams;
  const q = searchParamsToBooking(sp);

  // Two other rooms for the related rail — different slugs only, capped at 2.
  const related = rooms.filter((r) => r.slug !== room.slug).slice(0, 2);

  // Group features visually but in a single list — the labels are short
  // enough that a 2-col ledger reads cleanly on tablet+.
  const featureItems = room.features
    .map((f) => featureLabels[f as RoomFeature])
    .filter(Boolean);

  return (
    <main className="bg-white pb-24 md:pb-0">
      <PageHero
        eyebrow="Rooms & Suites"
        heading={room.name}
        description={room.tagline}
        image={room.cover}
        imageAlt={room.coverAlt}
        height="default"
      />

      {/* Breadcrumb sits as the first content row below the hero — keeps the
          hero card clean (no chrome inside the photo) and gives the trail a
          quiet "you are here" treatment. */}
      <Section tone="white" size="compact" className="!py-6 md:!py-8">
        <Breadcrumb
          items={[
            { label: "Rooms", href: "/rooms" },
            { label: room.name },
          ]}
        />
      </Section>

      {/* Main 2-col body */}
      <section className="px-4 sm:px-6 lg:px-10 pb-14 md:pb-20 lg:pb-[120px]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          {/* LEFT */}
          <div className="lg:col-span-2 min-w-0">
            <RoomGallery items={room.gallery} roomName={room.name} />

            <div className="mt-10 md:mt-14">
              <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-graybase mb-3">
                About this room
              </p>
              <h2 className="font-display font-medium text-[24px] md:text-[28px] lg:text-[32px] tracking-tight leading-[1.12] text-ink text-balance max-w-[34ch]">
                The shape of the stay
              </h2>
              <span
                aria-hidden
                className="mt-5 md:mt-6 block h-px w-14 bg-marine"
              />
              <p className="mt-6 md:mt-8 font-sans text-[15px] md:text-[16px] leading-[1.7] md:leading-[1.75] text-graybase max-w-[64ch]">
                {room.description}
              </p>
            </div>

            <div className="mt-10 md:mt-14">
              <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-graybase mb-3">
                What's included
              </p>
              <h3 className="font-display font-medium text-[20px] md:text-[24px] tracking-tight leading-[1.15] text-ink">
                Amenities, in plain words
              </h3>
              <span
                aria-hidden
                className="mt-4 md:mt-5 block h-px w-10 bg-marine/60"
              />
              <ul className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 font-sans text-[14px] md:text-[15px] text-ink">
                {featureItems.map((label) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 py-1 border-b border-ink/[0.07]"
                  >
                    <span
                      aria-hidden
                      className="inline-block h-1 w-1 rounded-full bg-marine"
                    />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {room.bestFor.length > 0 && (
              <div className="mt-10 md:mt-14">
                <p className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-graybase mb-3">
                  Best for
                </p>
                <h3 className="font-display font-medium text-[20px] md:text-[24px] tracking-tight leading-[1.15] text-ink">
                  Who tends to take this room
                </h3>
                <span
                  aria-hidden
                  className="mt-4 md:mt-5 block h-px w-10 bg-marine/60"
                />
                <ul className="mt-6 flex flex-wrap gap-2.5">
                  {room.bestFor.map((b) => (
                    <li
                      key={b}
                      className="inline-flex items-center font-sans text-[11.5px] md:text-[12px] tracking-[0.04em] text-ink border border-ink/15 rounded-full px-3.5 py-1.5 bg-cream/50"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-10 md:mt-14 border-t border-ink/10 pt-6 md:pt-8 flex flex-wrap items-baseline gap-x-6 gap-y-3 font-sans text-[13px] md:text-[14px] text-graybase">
              <span>
                From{" "}
                <span className="font-display font-semibold text-ink text-[16px] md:text-[18px]">
                  {formatDA(room.priceDA)}
                </span>{" "}
                / night
              </span>
              <span aria-hidden className="h-3 w-px bg-ink/15" />
              <span>{room.sizeDisplay}</span>
              <span aria-hidden className="h-3 w-px bg-ink/15" />
              <span>Sleeps {room.sleeps}</span>
              <span aria-hidden className="h-3 w-px bg-ink/15" />
              <span>
                {hotel.shortName} · {hotel.city}
              </span>
            </div>
          </div>

          {/* RIGHT: sticky on lg, collapses into a fixed bottom bar on mobile. */}
          <aside className="lg:col-span-1 lg:sticky lg:top-24 self-start">
            <BookThisRoom
              room={room}
              initial={{
                checkIn: q.checkIn,
                checkOut: q.checkOut,
                adults: q.adults,
                children: q.children,
              }}
            />
          </aside>
        </div>
      </section>

      {/* Related rooms rail */}
      {related.length > 0 && (
        <Section tone="cream" grain size="compact">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-8 md:mb-10">
            <div className="max-w-2xl">
              <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-3">
                Also at the lake
              </p>
              <h2 className="font-display font-medium text-[24px] md:text-[28px] lg:text-[32px] tracking-tight leading-[1.12] text-ink text-balance">
                Other rooms guests pair with this one
              </h2>
              <span aria-hidden className="mt-5 block h-px w-14 bg-marine" />
            </div>
            <div className="md:shrink-0">
              <Button href="/rooms" variant="secondary" size="default" arrow>
                See all rooms
              </Button>
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7">
            {related.map((r) => (
              <li key={r.slug} className="flex">
                <RoomCard room={r} variant="compact" />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </main>
  );
}
