import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * CTABanner component - Clones the "Got Stuff You Don't Use?" section.
 * Features a dark amber rounded container with centered text and a white button.
 */
const CTABanner = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 
          Container: Dark amber-tinged background, subtle border, large rounded corners.
          Matching high-level design: Large card with amber-tinged dark background.
        */}
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#1c1404] to-[#0a0a0a] border border-amber-500/10 py-16 px-6 md:px-12 text-center">
          {/* Subtle amber glow effect inside the card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-amber-500/5 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
              Got Stuff You Don&apos;t Use?
            </h2>
            
            <p className="text-white/60 text-lg leading-relaxed mb-10">
              Turn your idle items into extra income. List your books, gadgets, or 
              equipment and help fellow students while earning.
            </p>
            
            <div className="flex justify-center">
              <a 
                href="/list-item" 
                className="inline-flex items-center gap-2 bg-white text-black hover:bg-white/90 font-semibold px-8 py-3.5 rounded-lg transition-all duration-200 group shadow-lg"
              >
                <span>Start Listing</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;