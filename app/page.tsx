import About from '@/components/About';
import CTA from '@/components/CTA';
import { EventSchema, OrganizationSchema } from '@/components/EventSchema';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Organisers from '@/components/Organisers';
import Program from '@/components/Program';
import Speakers from '@/components/Speakers';
import Topics from '@/components/Topics';
import VideoCarousel from '@/components/VideoCarousel';

// ISR: regenerate every 24h. Currently all content is static (config-driven),
// so pages only truly update on redeploy. If dynamic content (e.g. DB-driven
// speakers/program) is added later, reduce this or add on-demand revalidation.
export const revalidate = 86400;

export default function Home() {
  return (
    <>
      <EventSchema />
      <OrganizationSchema />
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
