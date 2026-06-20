const navigateLinks = [
  { label: "Exhibit", href: "#exhibit" },
  { label: "Activities", href: "#activities" },
  { label: "Contact", href: "#contact" },
  { label: "Reservations", href: "#top" },
];

export default function Footer() {
  return (
    <footer className="grain relative bg-ink text-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-20 md:pt-[120px] pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div>
            <p className="font-display font-semibold text-2xl">Maison Dorée</p>
            <p className="font-sans text-[15px] text-white/55 mt-4 max-w-xs">
              A small house on the Riviera, kept for the unhurried.
            </p>
          </div>

          <div className="md:justify-self-center">
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-white/40 mb-5">
              Navigate
            </p>
            <ul className="flex flex-col gap-3 font-sans text-[15px] text-white/75">
              {navigateLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-accent">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:justify-self-end">
            <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-white/40 mb-5">
              Connect
            </p>
            <ul className="flex flex-col gap-3 font-sans text-[15px] text-white/75">
              <li>
                <a href="#" className="hover:text-accent">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Journal
                </a>
              </li>
              <li>
                <a
                  href="mailto:reservations@maisondoree.fr"
                  className="hover:text-accent"
                >
                  reservations@maisondoree.fr
                </a>
              </li>
              <li>
                <a href="tel:+33493000000" className="hover:text-accent">
                  +33 4 93 00 00 00
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-graybase/50 mt-16 md:mt-24 pt-8">
          <p className="font-sans text-[12px] text-white/35">
            © 2026 Maison Dorée — Saint-Jean-Cap-Ferrat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
