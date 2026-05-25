import { useState } from 'react';

interface NavbarProps {
  onStartClick: () => void;
}

export default function Navbar({ onStartClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E5E5E0] h-[60px] flex items-center transition-colors">
      <div className="mx-auto flex w-full max-w-[720px] items-center justify-between px-4">
        {/* Left branding */}
        <a href="#" className="font-sans font-bold text-[#1A1A1A] text-lg hover:text-[#4F46E5] transition-colors leading-none">
          FileFlux
        </a>

        {/* Right nav & CTA button */}
        <div className="flex items-center gap-5">
          <nav className="flex items-center gap-4 text-xs font-medium text-[#888888]">
            <a href="#how-it-works" className="hover:text-[#1A1A1A] transition-colors">
              Features
            </a>
            <a href="#formats" className="hover:text-[#1A1A1A] transition-colors">
              Formats
            </a>
            <a href="#faq" className="hover:text-[#1A1A1A] transition-colors">
              FAQ
            </a>
          </nav>
          
          <button
            onClick={onStartClick}
            className="inline-flex items-center justify-center rounded-lg bg-[#4F46E5] hover:bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Convert a file →
          </button>
        </div>
      </div>
    </header>
  );
}
