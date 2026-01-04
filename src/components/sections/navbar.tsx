"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Search, Plus, User, Menu, MapPin, X, Wallet, LogOut, LayoutGrid, Info, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [college, setCollege] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/browse?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('college')
          .eq('id', currentUser.uid)
          .single();
        if (profile) setCollege(profile.college);
      } else {
        setCollege(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  const navLinks = [
    { name: "Browse", href: "/browse", icon: LayoutGrid },
    { name: "Community", href: "/community", icon: Users },
    { name: "About Us", href: "/about", icon: Info },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b",
          scrolled 
            ? "bg-[#0a0a0a]/80 backdrop-blur-xl border-white/10 py-2" 
            : "bg-transparent border-transparent py-4"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-6">
              <motion.a 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 group" 
                href="/"
              >
                <div className="relative w-10 h-10 overflow-hidden rounded-xl group-hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-shadow">
                  <Image
                    alt="CampusRent Logo"
                    width={40}
                    height={40}
                    className="object-cover"
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/b48fb13b-38da-44b5-b185-34e5be49ded2/IMG_20260101_125410-resized-1767252593782.jpg?width=8000&height=8000&resize=contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-xl tracking-tighter hidden sm:inline-block font-bold">
                  <span className="text-white group-hover:text-amber-400 transition-colors">Campus</span>
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    Rent
                  </span>
                </span>
              </motion.a>
              
              {college && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-[10px] uppercase tracking-widest font-bold text-amber-400"
                >
                  <MapPin className="w-3 h-3" />
                  {college}
                </motion.div>
              )}
            </div>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8 group">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Find anything to rent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 rounded-xl border border-white/5 bg-white/5 px-4 pl-10 text-sm text-white transition-all placeholder:text-white/30 focus:outline-none focus:border-amber-400/30 focus:bg-white/10 focus:ring-4 focus:ring-amber-400/5 shadow-inner"
                />
              </div>
            </form>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href}>
                  <button className="relative px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors group">
                    {link.name}
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </button>
                </a>
              ))}
              
              <div className="h-4 w-[1px] bg-white/10 mx-2" />

              <a href="/list-item">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_25px_rgba(251,191,36,0.4)] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  List Item
                </motion.button>
              </a>
              
              {user ? (
                <div className="flex items-center gap-2 ml-2">
                  <a href="/wallet">
                    <button className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                      <Wallet className="w-5 h-5" />
                    </button>
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-white/60 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <a href="/login" className="ml-2">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 rounded-xl transition-all">
                    <User className="w-5 h-5" />
                    Login
                  </button>
                </a>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 md:hidden bg-[#0a0a0a] pt-24 px-6"
          >
            <div className="flex flex-col gap-6">
              <form onSubmit={handleSearch} className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Find anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 rounded-xl border border-white/5 bg-white/5 px-4 pl-12 text-white focus:outline-none focus:border-amber-400/30"
                />
              </form>

              <div className="grid grid-cols-2 gap-4">
                {navLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-400/30 transition-all group"
                  >
                    <link.icon className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{link.name}</span>
                  </a>
                ))}
              </div>

              <a 
                href="/list-item"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-2xl"
              >
                <Plus className="w-5 h-5" />
                List an Item
              </a>

              <div className="h-px bg-white/5 my-2" />

              {user ? (
                <div className="grid grid-cols-2 gap-4">
                  <a 
                    href="/wallet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 h-12 rounded-xl bg-white/5 text-sm font-medium"
                  >
                    <Wallet className="w-5 h-5" />
                    Wallet
                  </a>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 h-12 rounded-xl bg-red-400/10 text-red-400 text-sm font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              ) : (
                <a 
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-white/5 text-sm font-medium"
                >
                  <User className="w-5 h-5" />
                  Login / Register
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
