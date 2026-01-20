export default function Program() {
  return (
    <section id="program" className="bg-white py-16 px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold text-[#0099cc] uppercase tracking-widest mb-2">
            PROGRAM
          </div>
          <h2 className="font-serif text-[2rem] font-bold text-[#0a1f5c] mb-4">
            Two-Day Format
          </h2>
          <p className="text-[#5c6670] max-w-[700px] mx-auto">
            Detailed program to be announced. Here&apos;s the structure for the 2026 forum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
          {/* Day 1 */}
          <div className="bg-gradient-to-br from-[#0a1f5c] to-[#0047ba] rounded-lg p-8 text-white">
            <div className="text-[#00d4ff] font-bold text-sm mb-3 uppercase tracking-wider">
              Day 1 • Monday 22 June
            </div>
            <h3 className="font-serif text-2xl font-bold mb-6">
              Single-Track Program
            </h3>
            <ul className="space-y-3 text-sm opacity-90">
              <li className="flex items-start gap-3">
                <span className="text-[#00d4ff] mt-1">•</span>
                <span>Keynote speeches from leading AI safety experts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00d4ff] mt-1">•</span>
                <span>Panel discussions on technical and governance challenges</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00d4ff] mt-1">•</span>
                <span>Introduction to AI safety from both perspectives</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00d4ff] mt-1">•</span>
                <span>Evening networking reception</span>
              </li>
            </ul>
          </div>

          {/* Day 2 */}
          <div className="bg-[#f0f4f8] rounded-lg p-8 border-2 border-[#0099cc]">
            <div className="text-[#0099cc] font-bold text-sm mb-3 uppercase tracking-wider">
              Day 2 • Tuesday 23 June
            </div>
            <h3 className="font-serif text-2xl font-bold mb-6 text-[#0a1f5c]">
              Parallel Workshops
            </h3>
            <ul className="space-y-3 text-sm text-[#333333]">
              <li className="flex items-start gap-3">
                <span className="text-[#0099cc] mt-1">•</span>
                <span>Collaborative sessions on key AI safety questions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#0099cc] mt-1">•</span>
                <span>Focus on Australia&apos;s potential contributions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#0099cc] mt-1">•</span>
                <span>Lightning talks and breakout discussions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#0099cc] mt-1">•</span>
                <span>Networking and collaboration opportunities</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-[#5c6670] text-sm">
            Full program will be published closer to the event
          </p>
        </div>
      </div>
    </section>
  );
}
