export default function HowItWorks() {
  const steps = [
    {
      num: '1',
      title: 'Upload your file',
      desc: 'Drop any file into the box above.',
    },
    {
      num: '2',
      title: 'Pick what to do',
      desc: 'Choose to convert, compress, or resize.',
    },
    {
      num: '3',
      title: 'Download',
      desc: 'Get your file back instantly.',
    },
  ];

  return (
    <section id="how-it-works" className="py-8 bg-white transition-colors">
      <div className="mx-auto max-w-[720px] px-4">
        
        {/* Simple Heading */}
        <h2 className="text-[28px] font-bold text-[#1A1A1A] text-center tracking-tight mb-12">
          How it works
        </h2>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left md:text-center">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col items-start md:items-center">
              {/* Simple Big Number */}
              <span className="text-[32px] font-bold text-[#4F46E5] leading-none mb-3">
                {step.num}
              </span>

              {/* Simple Title */}
              <h3 className="text-base font-bold text-[#1A1A1A] mb-1">
                {step.title}
              </h3>

              {/* Simple Sentence */}
              <p className="text-sm text-[#888888] font-normal leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
