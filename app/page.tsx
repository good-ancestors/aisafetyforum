import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Topics from '@/components/Topics';
import About from '@/components/About';
import Program from '@/components/Program';
import VideoCarousel from '@/components/VideoCarousel';
import Speakers from '@/components/Speakers';
import Organisers from '@/components/Organisers';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

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
