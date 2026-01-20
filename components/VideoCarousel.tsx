'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useEffect } from 'react';

interface Video {
  id: string;
  title: string;
}

const videos: Video[] = [
  { id: 'NAPsi-ascbk', title: 'Introduction to the Forum - Liam Carroll' },
  { id: 'Z7ooppux_KM', title: 'State of AI - Tiberio Caetano' },
  { id: 'XimijBw-OIg', title: 'Technical AI Safety - Daniel Murfet' },
  { id: 'gookc8-X8T8', title: 'State of AI Governance - Kimberlee Weatherall' },
  { id: 'a7EIuKt0mG8', title: 'Red-Teaming for Generative AI - Hoda Heidari' },
  { id: 'lm_bhDEEvMw', title: 'Accelerating AI Safety Talent - Ryan Kidd' },
  { id: 'lg9gpXMkwTU', title: 'Frontier AI Safety Governance - Seth Lazar' },
  { id: 'qHqv3GvWBTM', title: 'ASI Safety via AIXI - Marcus Hutter' },
];

export default function VideoCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
  });

  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(autoplay);
  }, [emblaApi]);

  return (
    <section className="bg-[#f0f4f8] py-12">
      <div className="max-w-[1200px] mx-auto px-8 mb-8">
        <div className="text-xs font-semibold text-[#0099cc] uppercase tracking-widest mb-2">
          2024 HIGHLIGHTS
        </div>
        <h2 className="font-serif text-[1.75rem] font-bold text-[#0a1f5c]">
          Watch 2024 Sessions
        </h2>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5 pl-8 pr-5">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex-[0_0_min(400px,90vw)] min-w-0"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-video bg-[#0a1f5c]">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-[#0a1f5c]">
                    {video.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-8">
        <a
          href="https://youtube.com/playlist?list=PLPu7GaTnxbYxu4rV7tUDJjFB92aM8TjMi&feature=shared"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#0047ba] hover:text-[#0a1f5c] font-medium text-sm transition-colors"
        >
          View All Sessions →
        </a>
      </div>
    </section>
  );
}
