import Hero from "@/components/Hero";
import About from "@/components/About";
import Rooms from "@/components/Rooms";
import Dining from "@/components/Dining";
import Events from "@/components/Events";
import Exhibit from "@/components/Exhibit";
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
      <Events />
      <Exhibit />
      <Contact />
      <Footer />
      <ChatModal />
    </>
  );
}
