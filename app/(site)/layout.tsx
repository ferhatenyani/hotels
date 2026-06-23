// Shared layout for every storytelling / browse / contact page. Owns the
// site nav (NavbarCentered handles its own hero-aware mode change), the AI
// concierge ChatModal (visible site-wide as the floating FAB once you scroll
// past the home hero), and the global Footer.
//
// Booking funnel pages live in (booking)/ with their own slimmer layout —
// they intentionally drop the main nav and chat to keep the funnel focused.

import NavbarCentered from "@/components/NavbarCentered";
import Footer from "@/components/Footer";
import ChatModal from "@/components/ChatModal";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarCentered />
      {children}
      <Footer />
      <ChatModal />
    </>
  );
}
