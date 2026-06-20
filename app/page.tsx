import Hero from "@/components/Hero";
import About from "@/components/About";
import Rooms from "@/components/Rooms";
import Dining from "@/components/Dining";
import Activities from "@/components/Activities";
import Events from "@/components/Events";
import Exhibit from "@/components/Exhibit";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ChatModal from "@/components/ChatModal";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Rooms />
      <Dining />
      <Activities />
      <Events />
      <Exhibit />
      <Testimonials />
      <Contact />
      <Footer />
      <ChatModal />
    </>
  );
}
