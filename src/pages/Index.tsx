import Navbar from "@/components/mindly/Navbar";
import Hero from "@/components/mindly/Hero";
import Problem from "@/components/mindly/Problem";
import Features from "@/components/mindly/Features";
import Audience from "@/components/mindly/Audience";
import TechStack from "@/components/mindly/TechStack";
import Team from "@/components/mindly/Team";
import AISE from "@/components/mindly/AISE";
import Testimonials from "@/components/mindly/Testimonials";
import CTA from "@/components/mindly/CTA";
import Footer from "@/components/mindly/Footer";

const Index = () => {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <Problem />
      <Features />
      <Audience />
      <TechStack />
      <Team />
      <AISE />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
};

export default Index;
