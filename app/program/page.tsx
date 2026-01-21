import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Topics from '@/components/Topics';
import Program from '@/components/Program';
import VideoCarousel from '@/components/VideoCarousel';
import { eventConfig } from '@/lib/config';

export default function ProgramPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0a1f5c] via-[#1a3a8f] to-[#0047ba] text-white overflow-hidden py-16">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px]"></div>

          <div className="max-w-[1200px] mx-auto px-8 relative text-center">
            <h1 className="font-serif text-[clamp(2rem,5vw,3rem)] font-bold leading-tight mb-4">
              Program
            </h1>
            <p className="text-xl leading-relaxed opacity-90 max-w-[800px] mx-auto">
              {eventConfig.datesLong} • {eventConfig.venueLong}
            </p>
          </div>
        </section>

        {/* Topics */}
        <Topics />

        {/* 2026 Program Structure */}
        <Program />

        {/* CTA to Apply to Speak */}
        <section className="bg-gradient-to-br from-[#0a1f5c] to-[#0047ba] py-16 px-8">
          <div className="max-w-[800px] mx-auto text-center text-white">
            <h2 className="font-serif text-[2rem] font-bold mb-4">
              Be Part of the 2026 Program
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-[600px] mx-auto">
              We&apos;re looking for speakers to present keynotes, workshops, lightning talks, and panel discussions. Share your expertise with the Australian AI safety community.
            </p>
            <Link
              href="/speak"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-[0.95rem] font-bold bg-[#00d4ff] text-[#061440] rounded-md hover:bg-[#00b8e0] transition-colors"
            >
              Apply to Speak
            </Link>
          </div>
        </section>

        {/* 2024 Program Example */}
        <section className="bg-[#f0f4f8] py-16 px-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <div className="text-xs font-semibold text-[#0099cc] uppercase tracking-widest mb-2">
                2024 EXAMPLE
              </div>
              <h2 className="font-serif text-[2rem] font-bold text-[#0a1f5c] mb-4">
                2024 Program Schedule
              </h2>
              <p className="text-[#5c6670] max-w-[700px] mx-auto">
                Here&apos;s what the inaugural 2024 forum looked like. The 2026 program will follow a similar format.
              </p>
            </div>

            {/* Day 1 */}
            <div className="mb-12">
              <div className="bg-gradient-to-r from-[#0a1f5c] to-[#0047ba] text-white px-6 py-4 rounded-t-lg">
                <h3 className="font-bold text-xl">Day 1: Keynote Day — Thursday 7 November 2024</h3>
              </div>
              <div className="bg-white rounded-b-lg overflow-hidden shadow-sm">
                <div className="divide-y divide-[#e0e4e8]">
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">08:00</div>
                    <div className="text-sm text-[#333333]">Registration and complimentary barista coffee</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">09:00 - 09:30</div>
                    <div>
                      <div className="font-semibold text-[#0a1f5c] mb-1">Welcome & Opening</div>
                      <div className="text-sm text-[#5c6670]">Helen Wilson (Deputy Secretary, Science and Technology), Rupal Ismin (Sydney Knowledge Hub), Liam Carroll (Gradient Institute / Timaeus)</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">09:30</div>
                    <div>
                      <div className="font-semibold text-[#0a1f5c] mb-1">State of AI</div>
                      <div className="text-sm text-[#5c6670]">Tiberio Caetano, Gradient Institute</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">10:00</div>
                    <div>
                      <div className="font-semibold text-[#0a1f5c] mb-1">Technical AI Safety Landscape</div>
                      <div className="text-sm text-[#5c6670]">Daniel Murfet, University of Melbourne</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">10:30</div>
                    <div>
                      <div className="font-semibold text-[#0a1f5c] mb-1">AI Governance Overview</div>
                      <div className="text-sm text-[#5c6670]">Kimberlee Weatherall, University of Sydney</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 bg-[#f0f4f8]">
                    <div className="text-sm font-semibold text-[#0099cc]">11:00</div>
                    <div className="text-sm text-[#333333]">Morning tea break</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">11:30</div>
                    <div>
                      <div className="font-semibold text-[#0a1f5c] mb-1">Red-Teaming for Generative AI—Silver Bullet or Theater?</div>
                      <div className="text-sm text-[#5c6670]">Hoda Heidari, Carnegie Mellon University</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">12:15</div>
                    <div>
                      <div className="font-semibold text-[#0a1f5c] mb-1">Building AI Safety Talent Pipeline</div>
                      <div className="text-sm text-[#5c6670]">Ryan Kidd, MATS Research</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 bg-[#f0f4f8]">
                    <div className="text-sm font-semibold text-[#0099cc]">13:00</div>
                    <div className="text-sm text-[#333333]">Lunch</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">14:00</div>
                    <div>
                      <div className="font-semibold text-[#0a1f5c] mb-1">Frontier AI Governance Challenges</div>
                      <div className="text-sm text-[#5c6670]">Seth Lazar, Australian National University</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">14:45</div>
                    <div>
                      <div className="font-semibold text-[#0a1f5c] mb-1">ASI Safety via AIXI Framework</div>
                      <div className="text-sm text-[#5c6670]">Marcus Hutter, Australian National University</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 bg-[#f0f4f8]">
                    <div className="text-sm font-semibold text-[#0099cc]">15:30</div>
                    <div className="text-sm text-[#333333]">Afternoon tea break</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">16:00</div>
                    <div className="font-semibold text-[#0a1f5c]">Panel Discussion</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">17:00</div>
                    <div className="text-sm text-[#333333]">Networking and beverages</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Day 2 */}
            <div>
              <div className="bg-gradient-to-r from-[#0a1f5c] to-[#0047ba] text-white px-6 py-4 rounded-t-lg">
                <h3 className="font-bold text-xl">Day 2: Workshop Day — Friday 8 November 2024</h3>
              </div>
              <div className="bg-white rounded-b-lg overflow-hidden shadow-sm">
                <div className="divide-y divide-[#e0e4e8]">
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">08:30</div>
                    <div className="text-sm text-[#333333]">Doors open</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">09:00</div>
                    <div>
                      <div className="font-semibold text-[#0a1f5c] mb-1">Introduction to Day 2</div>
                      <div className="text-sm text-[#5c6670]">Liam Carroll, Gradient Institute / Timaeus</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">09:05</div>
                    <div>
                      <div className="font-semibold text-[#0a1f5c] mb-1">Workshop: International Scientific Report on Advanced AI Safety</div>
                      <div className="text-sm text-[#5c6670] mb-2">Daniel Murfet, University of Melbourne</div>
                      <div className="text-sm text-[#5c6670]">Explores capabilities, risks, and technical approaches for increasingly capable AI systems</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 bg-[#f0f4f8]">
                    <div className="text-sm font-semibold text-[#0099cc]">10:30</div>
                    <div className="text-sm text-[#333333]">Morning tea break</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">11:00</div>
                    <div className="space-y-4">
                      <div>
                        <div className="font-semibold text-[#0a1f5c] mb-1">Workshop Track A: International AI Safety Governance Roles for Australia</div>
                        <div className="text-sm text-[#5c6670]">Johanna Weaver (Tech Policy Design Institute), Chelle Adamson (DISR)</div>
                      </div>
                      <div>
                        <div className="font-semibold text-[#0a1f5c] mb-1">Workshop Track B: Defining &quot;Safe&quot; and &quot;Responsible&quot; AI</div>
                        <div className="text-sm text-[#5c6670]">Qinghua Lu (CSIRO), Alexander Saeri (MIT FutureTech)</div>
                      </div>
                      <div>
                        <div className="font-semibold text-[#0a1f5c] mb-1">Workshop Track C: Generalisation in AI Safety Science</div>
                        <div className="text-sm text-[#5c6670]">Daniel Murfet (University of Melbourne), Marcus Hutter (ANU)</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">12:00</div>
                    <div className="space-y-4">
                      <div>
                        <div className="font-semibold text-[#0a1f5c] mb-1">Workshop Track A: Frontier AI Governance Proposals</div>
                        <div className="text-sm text-[#5c6670]">Atoosa Kasirzadeh (Carnegie Mellon), Seth Lazar (ANU)</div>
                      </div>
                      <div>
                        <div className="font-semibold text-[#0a1f5c] mb-1">Workshop Track B: Emerging Technical AI Safety Practice</div>
                        <div className="text-sm text-[#5c6670]">Soroush Pour (Harmony Intelligence), Ryan Kidd (MATS), Karl Berzins (FAR AI)</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 bg-[#f0f4f8]">
                    <div className="text-sm font-semibold text-[#0099cc]">13:00</div>
                    <div className="text-sm text-[#333333]">Lunch</div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">14:00</div>
                    <div>
                      <div className="font-semibold text-[#0a1f5c] mb-1">Workshop: Potential Australian AI Safety Institute</div>
                      <div className="text-sm text-[#5c6670] mb-2">Nitarshan Rajkumar (University of Cambridge), Greg Sadler (Good Ancestors Policy)</div>
                      <div className="text-sm text-[#5c6670]">Discusses institute models and international examples from UK, US, and Japan</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4 p-4 hover:bg-[#f9fafb] transition-colors">
                    <div className="text-sm font-semibold text-[#0099cc]">15:50</div>
                    <div>
                      <div className="font-semibold text-[#0a1f5c]">Concluding Remarks</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Video Carousel */}
        <VideoCarousel />
      </main>
      <Footer />
    </>
  );
}
