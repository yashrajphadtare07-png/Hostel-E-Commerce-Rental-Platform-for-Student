"use client";

import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import { supabase } from '@/lib/supabase';

interface Stats {
  active_listings: number;
  happy_renters: number;
  hostels_connected: number;
  saved_monthly: number;
}

const HeroSection: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    active_listings: 0,
    happy_renters: 0,
    hostels_connected: 0,
    saved_monthly: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from('stats').select('key, value');
      if (data) {
        const statsMap: Stats = {
          active_listings: 0,
          happy_renters: 0,
          hostels_connected: 0,
          saved_monthly: 0,
        };
        data.forEach((item) => {
          if (item.key in statsMap) {
            statsMap[item.key as keyof Stats] = item.value;
          }
        });
        setStats(statsMap);
      }
    };

    fetchStats();

    const channel = supabase
      .channel('stats-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stats' },
        (payload) => {
          const newRecord = payload.new as { key: string; value: number };
          if (newRecord && newRecord.key) {
            setStats((prev) => ({
              ...prev,
              [newRecord.key]: newRecord.value,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98] as const,
      },
    },
  };

  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-[#0a0a0a]">
      {/* Dynamic Background Elements */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"
      ></motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
        className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"
      ></motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto"
      >
        <div className="text-center max-w-4xl mx-auto">
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-xs font-bold text-amber-400 mb-8 tracking-[0.2em] uppercase transition-all hover:bg-amber-500/10 cursor-default">
              <Sparkles className="w-3 h-3" />
              For College Students
            </div>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl font-black text-white mb-8 leading-[0.95] tracking-tighter"
          >
            Rent Anything from
            <span className="block mt-2 bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Fellow Students
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Why buy when you can borrow? Access books, electronics, sports gear, and more from students in your hostel. Save money, reduce waste, build community.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <a href="/browse" className="w-full sm:w-auto">
              <button 
                className="group relative flex items-center justify-center w-full sm:w-auto h-16 px-10 rounded-2xl bg-white text-black font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Start Browsing
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </a>
            <a href="/list-item" className="w-full sm:w-auto">
              <button 
                className="flex items-center justify-center w-full sm:w-auto h-16 px-10 rounded-2xl border border-white/10 bg-white/5 text-white font-bold text-lg hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 backdrop-blur-sm"
              >
                List Your Items
              </button>
            </a>
          </motion.div>
        </div>

        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-28"
        >
          <StatCard 
            label="Active Listings" 
            value={stats.active_listings} 
            prefix=""
          />
          <StatCard 
            label="Happy Renters" 
            value={stats.happy_renters} 
            prefix=""
          />
          <StatCard 
            label="Hostels Connected" 
            value={stats.hostels_connected} 
            prefix=""
          />
          <StatCard 
            label="Saved Monthly" 
            value={stats.saved_monthly} 
            prefix="₹"
            isCurrency
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

const StatCard = ({ label, value, prefix, isCurrency }: { label: string, value: number, prefix: string, isCurrency?: boolean }) => {
  return (
    <div className="relative group p-6 rounded-3xl border border-white/5 bg-white/[0.02] transition-all hover:bg-white/[0.05] hover:border-white/10">
      <div className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tighter">
        {prefix}{isCurrency ? value.toLocaleString('en-IN') : value}
      </div>
      <div className="text-white/40 font-bold uppercase tracking-widest text-[10px]">{label}</div>
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  );
};

export default HeroSection;
