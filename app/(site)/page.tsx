// Home page — sections only. NavbarCentered, Footer and ChatModal live in
// the (site)/layout.tsx so every site route gets them; the page itself is
// purely the home composition. This keeps the existing reservation feature
// (Hero's date/guest picker, then through to /booking/results) untouched.

import Hero from "@/components/Hero";
import About from "@/components/About";
import Rooms from "@/components/Rooms";
import Dining from "@/components/Dining";
import Events from "@/components/Events";
import Exhibit from "@/components/Exhibit";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Rooms />
      <Dining />
      <Events />
      <Exhibit />
      <Contact />
    </>
  );
}
