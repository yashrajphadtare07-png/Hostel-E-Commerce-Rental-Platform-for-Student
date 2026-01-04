import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Browse & Discover',
      description: 'Search through items listed by students in your hostel or nearby blocks. Filter by category, price, or availability.',
    },
    {
      number: '02',
      title: 'Request & Connect',
      description: 'Send a rental request to the owner. Chat directly to arrange pickup time and discuss any questions.',
    },
    {
      number: '03',
      title: 'Rent & Return',
      description: 'Pick up the item, use it for your needs, and return it on time. Leave a review to help other students.',
    },
  ];

  return (
    <section className="py-24 px-4 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto">
            Simple, secure, and student-friendly
          </p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {steps.map((step) => (
            <div key={step.number} className="relative group">
              {/* Large Outlined Background Number */}
              <div 
                className="absolute -top-12 -left-4 select-none pointer-events-none opacity-10 transition-opacity duration-300 group-hover:opacity-20"
                style={{
                  fontSize: '120px',
                  fontWeight: '800',
                  lineHeight: '1',
                  color: 'transparent',
                  WebkitTextStroke: '2px #fbbf24',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {step.number}
              </div>

              {/* Content Box */}
              <div className="relative z-10 pt-4">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="md:hidden mr-3 text-amber-400 text-lg font-mono">{step.number}.</span>
                  {step.title}
                </h3>
                <p className="text-white/60 text-base leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Decorative Accent on Hover */}
              <div className="absolute -bottom-4 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Styled JSX for the outlined text effect as per instructions - using standard CSS instead for reliability in Next.js 15 */}
      <style dangerouslySetInnerHTML={{ __html: `
        .outlined-number {
          -webkit-text-stroke: 2px rgba(251, 191, 36, 0.2);
          color: transparent;
        }
      `}} />
    </section>
  );
};

export default HowItWorks;