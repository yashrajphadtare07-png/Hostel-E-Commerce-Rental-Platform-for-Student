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