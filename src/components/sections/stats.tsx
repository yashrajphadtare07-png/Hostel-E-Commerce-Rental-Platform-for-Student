import React from 'react';

const stats = [
  {
    value: '500+',
    label: 'Active Listings',
  },
  {
    value: '1.2k',
    label: 'Happy Renters',
  },
  {
    value: '15+',
    label: 'Hostels Connected',
  },
  {
    value: '₹25k+',
    label: 'Saved Monthly',
  },
];

const Stats = () => {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
        {stats.map((stat, index) => (
          <div key={index} className="text-center group">
            <div 
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#fbbf24] to-[#f97316] bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-110"
              style={{
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                letterSpacing: '-0.025em',
              }}
            >
              {stat.value}
            </div>
            <div 
              className="mt-2 text-sm md:text-base font-medium"
              style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;