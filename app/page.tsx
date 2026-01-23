import About from '@/components/About';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Organisers from '@/components/Organisers';
import Program from '@/components/Program';
import Speakers from '@/components/Speakers';
import Topics from '@/components/Topics';
import VideoCarousel from '@/components/VideoCarousel';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Topics />
        <About />
        <CTA />
        <Program />
        <VideoCarousel />
        <Speakers />
        <Organisers />
      </main>
      <Footer />
    </>
  );
}
