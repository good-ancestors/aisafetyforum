export default function About() {
  return (
    <section className="bg-white border-t border-b border-[--border]">
      <div className="max-w-[1200px] mx-auto px-8 py-20">
        <div className="mb-12">
          <div className="text-xs font-semibold text-[--teal] uppercase tracking-widest mb-2">About the Forum</div>
          <h2 className="font-[--font-libre-baskerville] text-[2rem] font-bold text-[--navy] inline-block relative pb-4 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[--navy] after:to-[--cyan]">
            Why Attend
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-[--text-body]">
              Building on the success of our inaugural 2024 event, the Australian AI Safety Forum brings together the nation&apos;s leading voices on AI safety and governance.
            </p>
            <p className="text-lg leading-relaxed text-[--text-body]">
              Grounded in the International Scientific Report on the Safety of Advanced AI, the forum fosters evidence-based discussions on technical and governance challenges facing Australia and the world.
            </p>
          </div>

          <ul className="space-y-0">
            <li className="flex items-start gap-4 py-5 border-b border-[--border]">
              <div className="relative w-12 h-12 rounded-[10px] bg-gradient-to-br from-[--navy] to-[--blue] flex items-center justify-center text-xl flex-shrink-0 after:content-[''] after:absolute after:w-3 after:h-3 after:bg-[--cyan] after:rounded-full after:-top-1 after:-right-1 after:shadow-[0_0_8px_var(--cyan)]">
                🔬
              </div>
              <div>
                <strong className="block text-lg text-[--navy] mb-1">Evidence-Based</strong>
                <span className="text-[0.95rem] text-[--text-muted] leading-relaxed">
                  Discussions grounded in rigorous research and the International Scientific Report on AI Safety
                </span>
              </div>
            </li>
            <li className="flex items-start gap-4 py-5 border-b border-[--border]">
              <div className="relative w-12 h-12 rounded-[10px] bg-gradient-to-br from-[--navy] to-[--blue] flex items-center justify-center text-xl flex-shrink-0 after:content-[''] after:absolute after:w-3 after:h-3 after:bg-[--cyan] after:rounded-full after:-top-1 after:-right-1 after:shadow-[0_0_8px_var(--cyan)]">
                🌏
              </div>
              <div>
                <strong className="block text-lg text-[--navy] mb-1">Australian Focus</strong>
                <span className="text-[0.95rem] text-[--text-muted] leading-relaxed">
                  Exploring our unique position in the global AI safety landscape and our potential contributions
                </span>
              </div>
            </li>
            <li className="flex items-start gap-4 py-5">
              <div className="relative w-12 h-12 rounded-[10px] bg-gradient-to-br from-[--navy] to-[--blue] flex items-center justify-center text-xl flex-shrink-0 after:content-[''] after:absolute after:w-3 after:h-3 after:bg-[--cyan] after:rounded-full after:-top-1 after:-right-1 after:shadow-[0_0_8px_var(--cyan)]">
                🤝
              </div>
              <div>
                <strong className="block text-lg text-[--navy] mb-1">Cross-Sector</strong>
                <span className="text-[0.95rem] text-[--text-muted] leading-relaxed">
                  Researchers, policymakers, and industry leaders working together towards common goals
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
