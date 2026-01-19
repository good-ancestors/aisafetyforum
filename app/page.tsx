import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Topics from '@/components/Topics';
import About from '@/components/About';
import VideoCarousel from '@/components/VideoCarousel';
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
        <VideoCarousel />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
