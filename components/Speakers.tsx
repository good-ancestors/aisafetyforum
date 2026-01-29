'use client';

import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { useCallback } from 'react';

export default function Speakers() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const speakers2024 = [
    {
      name: 'Marcus Hutter',
      affiliation: 'Australian National University',
      title: 'Honorary Professor, Senior Researcher at DeepMind',
      image: '/speakers/marcus-hutter.jpg',
      website: 'https://www.hutter1.net/',
      linkedin: 'https://www.linkedin.com/in/hutter1/',
      twitter: 'https://x.com/mhutter42',
    },
    {
      name: 'Hoda Heidari',
      affiliation: 'Carnegie Mellon University',
      title: 'Assistant Professor in Ethics and Computational Technologies',
      image: '/speakers/hoda-heidari.webp',
      website: 'https://www.cs.cmu.edu/~hheidari/',
      linkedin: 'https://www.linkedin.com/in/hoda-heidari-b214a4257/',
      twitter: 'https://twitter.com/hodaheidari',
    },
    {
      name: 'Seth Lazar',
      affiliation: 'Australian National University',
      title: 'Professor of Philosophy, ARC Future Fellow',
      image: '/speakers/seth-lazar.jpg',
      website: 'https://sethlazar.org/',
      linkedin: null,
      twitter: 'https://x.com/sethlazar',
    },
    {
      name: 'Ryan Kidd',
      affiliation: 'ML Alignment & Theory Scholars',
      title: 'Co-Executive Director',
      image: '/speakers/ryankidd.webp',
      website: 'https://www.matsprogram.org/',
      linkedin: 'https://www.linkedin.com/in/ryan-kidd-1b0574a3/',
      twitter: 'https://x.com/ryan_kidd44',
    },
    {
      name: 'Tiberio Caetano',
      affiliation: 'Gradient Institute',
      title: 'Chief Scientist',
      image: '/speakers/tiberio_headshot.jpg',
      website: 'https://tiberiocaetano.com/',
      linkedin: 'https://www.linkedin.com/in/tiberio-caetano-2646318/',
      twitter: 'https://twitter.com/tiberiocaetano',
    },
    {
      name: 'Daniel Murfet',
      affiliation: 'Timaeus',
      title: 'Director of Research',
      image: '/speakers/daniel-murfet.webp',
      website: 'https://timaeus.co/',
      linkedin: 'https://au.linkedin.com/in/daniel-murfet-53219226',
      twitter: 'https://x.com/danielmurfet',
    },
    {
      name: 'Kimberlee Weatherall',
      affiliation: 'The University of Sydney',
      title: 'Professor of Law',
      image: '/speakers/kimberlee-weatherall.jpeg',
      website: 'https://www.sydney.edu.au/law/about/our-people/academic-staff/kimberlee-weatherall.html',
      linkedin: 'https://www.linkedin.com/in/kimweatherall/',
      twitter: 'https://x.com/kim_weatherall',
    },
  ];

  return (
    <section id="speakers" className="bg-white py-16">
      <div className="max-w-[1200px] mx-auto px-8 mb-12">
        <div className="text-center">
          <div className="text-xs font-semibold text-teal uppercase tracking-widest mb-2">
            SPEAKERS
          </div>
          <h2 className="font-serif text-[2rem] font-bold text-navy mb-4">
            Distinguished Experts in AI Safety
          </h2>
          <p className="text-muted max-w-[700px] mx-auto">
            Our 2026 lineup will be announced soon. Here are some of the distinguished speakers who contributed to the 2024 inaugural forum.
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Left gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        {/* Right gradient fade */}
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {speakers2024.map((speaker) => (
              <div key={speaker.name} className="flex-[0_0_70%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_20%] xl:flex-[0_0_16%] min-w-0 px-2">
                <div className="bg-light rounded-lg overflow-hidden border-l-4 border-teal h-full flex flex-col">
                  <div className="relative w-full aspect-square bg-gradient-to-br from-navy to-brand-blue overflow-hidden">
                    {speaker.image ? (
                      <Image
                        src={speaker.image}
                        alt={speaker.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-serif font-bold">
                        {speaker.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-base text-navy mb-1">
                      {speaker.name}
                    </h3>
                    <div className="text-xs text-muted mb-2 line-clamp-2">
                      {speaker.affiliation}
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-2 mt-auto">
                      {speaker.website && (
                        <a
                          href={speaker.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal hover:text-navy transition-colors"
                          aria-label={`${speaker.name}'s website`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                      {speaker.linkedin && (
                        <a
                          href={speaker.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal hover:text-navy transition-colors"
                          aria-label={`${speaker.name}'s LinkedIn`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </a>
                      )}
                      {speaker.twitter && (
                        <a
                          href={speaker.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal hover:text-navy transition-colors"
                          aria-label={`${speaker.name}'s Twitter/X`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={scrollPrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-2 border-navy text-navy hover:bg-navy hover:text-white transition-colors shadow-lg flex items-center justify-center z-20"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-2 border-navy text-navy hover:bg-navy hover:text-white transition-colors shadow-lg flex items-center justify-center z-20"
          aria-label="Next slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mt-12">
          <p className="text-muted mb-6">
            Interested in speaking at the 2026 forum?
          </p>
          <a
            href="/speak"
            className="inline-flex items-center gap-2 px-6 py-3 text-[0.95rem] font-semibold bg-navy text-white rounded-md hover:bg-navy-dark transition-colors"
          >
            Submit a Proposal
          </a>
        </div>
      </div>
    </section>
  );
}
