'use client';

import React from 'react';
import { 
  BookOpen, 
  Laptop, 
  Dumbbell, 
  Guitar, 
  Camera, 
  Utensils, 
  ArrowRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  {
    name: 'Books',
    count: '234 items',
    icon: <BookOpen className="w-7 h-7 text-white" />,
    gradient: 'from-blue-500 to-indigo-600',
    href: '/browse?category=books'
  },
  {
    name: 'Electronics',
    count: '156 items',
    icon: <Laptop className="w-7 h-7 text-white" />,
    gradient: 'from-purple-500 to-fuchsia-600',
    href: '/browse?category=electronics'
  },
  {
    name: 'Sports',
    count: '89 items',
    icon: <Dumbbell className="w-7 h-7 text-white" />,
    gradient: 'from-emerald-500 to-teal-600',
    href: '/browse?category=sports'
  },
  {
    name: 'Music',
    count: '67 items',
    icon: <Guitar className="w-7 h-7 text-white" />,
    gradient: 'from-pink-500 to-rose-600',
    href: '/browse?category=music'
  },
  {
    name: 'Photography',
    count: '45 items',
    icon: <Camera className="w-7 h-7 text-white" />,
    gradient: 'from-cyan-500 to-blue-600',
    href: '/browse?category=photography'
  },
  {
    name: 'Kitchen',
    count: '112 items',
    icon: <Utensils className="w-7 h-7 text-white" />,
    gradient: 'from-orange-500 to-amber-600',
    href: '/browse?category=kitchen'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
} as const;

const CategoriesSection = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
              Browse <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Categories</span>
            </h2>
            <p className="text-white/40 text-lg font-medium max-w-md leading-relaxed">
              Explore our curated selection of high-quality items available for rent in your hostel community.
            </p>
          </motion.div>
          
          <motion.a 
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            href="/browse" 
            className="group relative inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-white font-semibold transition-all hover:bg-white/10 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            <span>View All Categories</span>
            <div className="bg-amber-500 rounded-full p-1 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4 text-black" />
            </div>
          </motion.a>
        </div>

        {/* Grid Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          {categories.map((category) => (
            <motion.a 
              key={category.name} 
              href={category.href} 
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="block group relative"
            >
              <div 
                className="h-full flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-8 transition-colors group-hover:bg-white/[0.08] group-hover:border-white/20"
              >
                {/* Icon Container with Gradient and Hover Effects */}
                <div 
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-6 shadow-2xl relative group-hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-shadow duration-300`}
                >
                  <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {category.icon}
                </div>
                
                {/* Text Content */}
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{category.name}</h3>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-amber-500/50" />
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30 group-hover:text-white/50 transition-colors">
                    {category.count}
                  </p>
                </div>

                {/* Corner Decoration */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-white/20 rotate-[-45deg]" />
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;
