import React from 'react';

export default function FeaturesSection() {
  const features = [
    {
      title: "Private by design",
      desc: "Your files never go to a server. All sharing, converting, and resizing happens right inside your browser window."
    },
    {
      title: "No waiting time",
      desc: "Since files don't need to be uploaded to any server, your files convert and download in a fraction of a second."
    },
    {
      title: "Free of cost",
      desc: "No account signup, no email inputs, no subscriptions. Use it as much as you need without paying anything."
    }
  ];

  return (
    <section id="features" className="py-8 bg-white transition-colors">
      <div className="mx-auto max-w-[720px] px-4">
        {/* Simple Heading */}
        <h2 className="text-[28px] font-bold text-[#1A1A1A] text-left tracking-tight mb-8">
          Why FileFlux?
        </h2>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col">
              <h3 className="text-base font-bold text-[#1A1A1A] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#888888] font-normal leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
