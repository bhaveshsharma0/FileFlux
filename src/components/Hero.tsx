import React, { useRef } from 'react';

interface HeroProps {
  onStartClick: () => void;
}

export default function Hero({ onStartClick }: HeroProps) {
  return (
    <section className="bg-white py-12 text-center">
      <div className="mx-auto max-w-[580px] px-4 flex flex-col items-center">
        {/* Small subtitle above */}
        <span className="text-xs font-medium text-[#888888] tracking-normal mb-3">
          Free · No account needed · Files never leave your device
        </span>

        {/* Big clean headline */}
        <h1 className="text-[44px] md:text-[48px] font-extrabold text-[#1A1A1A] leading-[1.1] tracking-tight mb-4">
          Convert any file.<br />Instantly.
        </h1>

        {/* Short explanation line */}
        <p className="text-sm md:text-base text-[#888888] font-normal leading-relaxed mb-6 max-w-[500px]">
          Upload a file and we'll help you convert, compress, or resize it.<br />
          Everything runs in your browser — nothing is uploaded to any server.
        </p>

        {/* Clear Action Button */}
        <button
          onClick={onStartClick}
          className="inline-flex items-center justify-center rounded-lg bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3 transition-colors cursor-pointer"
        >
          Choose a file to start →
        </button>
      </div>
    </section>
  );
}
