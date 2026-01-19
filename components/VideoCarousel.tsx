'use client';

import { useState } from 'react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
}

// Placeholder videos - replace with actual video IDs from the channel
const videos: Video[] = [
  {
    id: 'VIDEO_ID_1',
    title: 'Session 1: Opening Keynote',
    thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_1/maxresdefault.jpg',
  },
  {
    id: 'VIDEO_ID_2',
    title: 'Session 2: Technical AI Safety Panel',
    thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_2/maxresdefault.jpg',
  },
  {
    id: 'VIDEO_ID_3',
    title: 'Session 3: AI Governance Discussion',
    thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_3/maxresdefault.jpg',
  },
];

export default function VideoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextVideo = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  return (
    <section className="bg-white py-20 px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-12">
          <div className="text-xs font-semibold text-[#0099cc] uppercase tracking-widest mb-2">
            2024 HIGHLIGHTS
          </div>
          <h2 className="font-serif text-[2rem] font-bold text-[#0a1f5c] inline-block relative pb-4 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#0a1f5c] after:to-[#00d4ff]">
            Watch 2024 Sessions
          </h2>
        </div>

        <div className="relative">
          {/* Video Player */}
          <div className="aspect-video bg-[#0a1f5c] rounded-lg overflow-hidden mb-6">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videos[currentIndex].id}`}
              title={videos[currentIndex].title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>

          {/* Video Title */}
          <h3 className="text-xl font-semibold text-[#0a1f5c] mb-6">
            {videos[currentIndex].title}
          </h3>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevVideo}
              className="px-6 py-3 bg-[#0a1f5c] text-white rounded-md hover:bg-[#061440] transition-colors disabled:opacity-50"
              disabled={videos.length <= 1}
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              {videos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-[#0047ba]' : 'bg-[#e0e4e8]'
                  }`}
                  aria-label={`Go to video ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextVideo}
              className="px-6 py-3 bg-[#0a1f5c] text-white rounded-md hover:bg-[#061440] transition-colors disabled:opacity-50"
              disabled={videos.length <= 1}
            >
              Next →
            </button>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {videos.map((video, index) => (
              <button
                key={video.id}
                onClick={() => setCurrentIndex(index)}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-[#0047ba] ring-2 ring-[#00d4ff]'
                    : 'border-[#e0e4e8] hover:border-[#0047ba]'
                }`}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-sm font-medium line-clamp-2">
                    {video.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <a
            href="https://www.youtube.com/channel/UCIMzjJCNp3fzcyc-ak17WRA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#0047ba] hover:text-[#0a1f5c] font-medium transition-colors"
          >
            View All 2024 Sessions on YouTube →
          </a>
        </div>
      </div>
    </section>
  );
}
