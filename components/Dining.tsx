import Image from "next/image";

const hours = [
  { label: "Breakfast", value: "06:30 – 10:30 · included" },
  { label: "Lunch", value: "12:00 – 14:30" },
  { label: "Dinner", value: "19:00 – 22:00" },
];

export default function Dining() {
  return (
    <section
      id="dining"
      className="grain bg-cream px-4 sm:px-6 lg:px-10 py-20 md:py-[120px]"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Image */}
          <div className="overflow-hidden order-1 lg:order-none">
            {/* TODO(demo): real photo of the restaurant with the Lac Mézaïa view. */}
            <Image
              src="/images/exhibit-dining-room.jpg"
              alt="The restaurant at Hôtel du Lac, overlooking Lac Mézaïa"
              width={1200}
              height={1000}
              className="w-full aspect-[5/4] object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Copy */}
          <div className="lg:pl-4">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-graybase mb-4">
              The restaurant
            </p>
            <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ink text-balance">
              A table with a view of the water
            </h2>
            <span aria-hidden className="mt-6 block h-px w-14 bg-marine" />
            <p className="mt-7 font-sans font-normal text-[16px] leading-[1.75] text-graybase max-w-xl">
              Our restaurant carries all the comfort of a true house of
              gastronomy — <span className="italic">une carte d&apos;excellence
              ouverte sur le monde</span> — set against a wide, panoramic view of
              Lac Mézaïa. Mornings begin with the breakfast guests so often
              single out: fresh fruit and warm pastries. Lunch and dinner follow
              against the lake and the mountain.
            </p>

            <dl className="mt-9 flex flex-col gap-4 max-w-md">
              {hours.map((h) => (
                <div
                  key={h.label}
                  className="flex items-baseline justify-between gap-4 border-t border-ink/15 pt-3"
                >
                  <dt className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink/60">
                    {h.label}
                  </dt>
                  <dd className="font-sans text-[14px] text-ink text-right">
                    {h.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
