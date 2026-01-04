"use client";

import React from 'react';
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import { motion } from "framer-motion";
import { 
  Lightbulb, 
  Target, 
  Handshake, 
  Leaf, 
  Users, 
  ShieldCheck, 
  IndianRupee, 
  Building2,
  ArrowRight,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#060606] text-white selection:bg-amber-500/30 overflow-x-hidden">
      <Navbar />
      
      {/* Hero Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4 max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="text-center mb-24"
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3" />
            <span>Empowering Student Communities</span>
          </motion.div>
          <motion.h1 
            variants={fadeIn}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
          >
            Redefining <br className="hidden md:block" /> 
            <span className="text-amber-500">Hostel Living.</span>
          </motion.h1>
          <motion.p 
            variants={fadeIn}
            className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            We are building a peer-to-peer sharing ecosystem designed exclusively for students, making campus life more sustainable, affordable, and connected.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-amber-400" />
              </span>
              Our Story
            </h2>
            <div className="space-y-4 text-white/70 text-lg">
              <p>
                Hostel life is a unique journey, but it often comes with hidden costs. Students frequently need items for short durations—whether it's a specific textbook, a temporary heater, or sports equipment for a weekend match.
              </p>
              <p>
                Buying everything new isn't just expensive; it's wasteful. We saw an opportunity to bridge this gap by creating a platform where students can safely lend and borrow from people they already know—their fellow residents.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-amber-500">500+</span>
                <span className="text-sm text-white/40">Active Students</span>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-amber-500">1.2k</span>
                <span className="text-sm text-white/40">Items Shared</span>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-amber-500">20%</span>
                <span className="text-sm text-white/40">Savings Avg.</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-3xl -z-10" />
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                How it works
              </h3>
              <div className="space-y-4">
                {[
                  { title: "List", desc: "Snap a photo of items you don't use every day." },
                  { title: "Connect", desc: "Receive requests from verified campus peers." },
                  { title: "Earn/Save", desc: "Make extra cash or save money by borrowing." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sm font-bold text-amber-400">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-white/50">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mission Grid */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Core Mission</h2>
            <p className="text-white/50 max-w-xl mx-auto">Promoting sharing, sustainability, and student support through technology.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <IndianRupee className="w-6 h-6" />, title: "Economic Support", desc: "Reducing unnecessary spending for students on tight budgets.", color: "emerald" },
              { icon: <Leaf className="w-6 h-6" />, title: "Sustainability", desc: "Encouraging a circular economy by reusing resources efficiently.", color: "green" },
              { icon: <Users className="w-6 h-6" />, title: "Community", desc: "Strengthening the hostel bonds through trust-based sharing.", color: "purple" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors group"
              >
                  <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    {React.cloneElement(item.icon as React.ReactElement<any>, { className: `w-6 h-6 text-${item.color}-400` })}
                  </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-white/50 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="py-24 px-8 md:px-12 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <Globe className="w-64 h-64 text-amber-500" />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Why CampusRent?</h2>
              <p className="text-white/60 text-lg mb-8">
                We're more than just a marketplace. We're a closed-loop ecosystem designed for the unique needs of hostel life.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <Building2 />, title: "Campus-focused", text: "Exclusively for verified college hostel students." },
                  { icon: <ShieldCheck />, title: "Safe & Trusted", text: "Identity verification ensures peer-to-peer safety." },
                  { icon: <Handshake />, title: "Community-driven", text: "Built by students, specifically for the student life." }
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                        {React.cloneElement(feature.icon as React.ReactElement<any>, { className: "w-5 h-5" })}
                      </div>
                    <div>
                      <p className="font-semibold">{feature.title}</p>
                      <p className="text-sm text-white/40">{feature.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 mt-8">
                <div className="aspect-square rounded-3xl bg-amber-500/20 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-4xl mb-2">🤝</span>
                  <p className="text-sm font-medium">Peer Trust</p>
                </div>
                <div className="aspect-[4/5] rounded-3xl bg-blue-500/20 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-4xl mb-2">📚</span>
                  <p className="text-sm font-medium">Study Support</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="aspect-[4/5] rounded-3xl bg-emerald-500/20 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-4xl mb-2">♻️</span>
                  <p className="text-sm font-medium">Eco Friendly</p>
                </div>
                <div className="aspect-square rounded-3xl bg-purple-500/20 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-4xl mb-2">⚡</span>
                  <p className="text-sm font-medium">Instant Access</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 text-center py-20 px-4 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to share?</h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">Join the movement and start saving while building a better campus community today.</p>
          <button className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto">
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
