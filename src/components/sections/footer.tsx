import React from 'react';
import Image from 'next/image';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0a0a0a] border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2">
            <div className="relative w-10 h-10 overflow-hidden rounded-lg">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/b48fb13b-38da-44b5-b185-34e5be49ded2/IMG_20260101_125410-resized-1767252593782.jpg?width=8000&amp;height=8000&amp;resize=contain"
                alt="CampusRent Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xl tracking-tight font-bold font-sans">
              <span className="text-white">Campus</span>
              <span className="bg-gradient-to-r from-[#fbbf24] to-[#f97316] bg-clip-text text-transparent">Rent</span>
            </span>
          </a>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <a 
            href="/browse" 
            className="text-sm font-medium text-white/40 hover:text-white transition-colors"
          >
            Browse
          </a>
          <a 
            href="/list-item" 
            className="text-sm font-medium text-white/40 hover:text-white transition-colors"
          >
            List Item
          </a>
          <a 
            href="/about" 
            className="text-sm font-medium text-white/40 hover:text-white transition-colors"
          >
            About
          </a>
          <a 
            href="/contact" 
            className="text-sm font-medium text-white/40 hover:text-white transition-colors"
          >
            Contact
          </a>
          <a 
            href="https://github.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-white/40 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
        </nav>

        {/* Copyright Notice */}
        <div className="text-sm text-white/40 font-medium">
          © {currentYear} CampusRent. Made for students.
        </div>
      </div>
    </footer>
  );
};

export default Footer;