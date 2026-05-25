import { SUPPORTED_BADGES } from '../types';

export default function SupportedFormats() {
  return (
    <section id="formats" className="py-8 bg-white transition-colors">
      <div className="mx-auto max-w-[720px] px-4">
        
        {/* Small Heading */}
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 text-left">
          Supports 30+ file types
        </h3>

        {/* Pill list */}
        <div className="flex flex-wrap gap-2 justify-start">
          {SUPPORTED_BADGES.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center justify-center rounded bg-[#F5F5F3] border border-[#E5E5E0] px-3 py-1 text-xs font-semibold text-[#888888]"
            >
              {badge}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
