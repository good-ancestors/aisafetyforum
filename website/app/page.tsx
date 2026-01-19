import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Topics from '@/components/Topics';
import About from '@/components/About';
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
      </main>
      <Footer />
    </>
  );
}
