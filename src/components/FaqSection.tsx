import { useState } from 'react';
import { FAQ_ITEMS } from '../types';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-8 bg-white transition-colors">
      <div className="mx-auto max-w-[600px] px-4">
        
        {/* Simple Heading */}
        <h2 className="text-[28px] font-bold text-[#1A1A1A] text-center tracking-tight mb-8">
          Common questions
        </h2>

        {/* FAQ list */}
        <div className="divide-y divide-[#E5E5E0]">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={index} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="flex w-full items-center justify-between text-left font-semibold text-[#1A1A1A] hover:text-[#4F46E5] transition-colors cursor-pointer text-sm py-1"
                >
                  <span className="leading-snug pr-4">
                    {item.question}
                  </span>
                  <span className="text-xs text-[#888888] font-mono shrink-0 select-none">
                    {isOpen ? '↓' : '→'}
                  </span>
                </button>

                {/* Animated / simple collapse block */}
                {isOpen && (
                  <div className="mt-2 text-xs md:text-sm text-[#888888] leading-relaxed transition-all">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
