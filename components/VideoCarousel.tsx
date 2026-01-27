'use client';

import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';

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

function VideoCard({ video }: { video: Video }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="aspect-video bg-[#0a1f5c]">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-[#0a1f5c]">
            {video.title}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsPlaying(true)}
        className="relative aspect-video w-full bg-[#0a1f5c] group cursor-pointer"
        aria-label={`Play ${video.title}`}
      >
        {/* Thumbnail using Next.js Image with YouTube thumbnail */}
        <Image
          src={`/video-thumbnails/${video.id}.jpg`}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 85vw, (max-width: 768px) 60vw, (max-width: 1024px) 45vw, (max-width: 1280px) 35vw, 28vw"
          onError={(e) => {
            // Fallback to a solid background if thumbnail doesn't exist
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </button>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-[#0a1f5c]">
          {video.title}
        </h3>
      </div>
    </div>
  );
}

export default function VideoCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
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

      <div className="relative w-full overflow-hidden">
        {/* Left gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[#f0f4f8] to-transparent z-10 pointer-events-none" />
        {/* Right gradient fade */}
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[#f0f4f8] to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex-[0_0_85%] sm:flex-[0_0_60%] md:flex-[0_0_45%] lg:flex-[0_0_35%] xl:flex-[0_0_28%] min-w-0 px-2"
              >
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={scrollPrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-2 border-[#0a1f5c] text-[#0a1f5c] hover:bg-[#0a1f5c] hover:text-white transition-colors shadow-lg flex items-center justify-center z-20"
          aria-label="Previous video"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-2 border-[#0a1f5c] text-[#0a1f5c] hover:bg-[#0a1f5c] hover:text-white transition-colors shadow-lg flex items-center justify-center z-20"
          aria-label="Next video"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
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
