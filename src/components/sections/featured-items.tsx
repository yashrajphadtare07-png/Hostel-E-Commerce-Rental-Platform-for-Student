"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, MapPin, Star, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { TrustBadge } from '@/components/ui/trust-badge';

interface FeaturedItem {
  id: number;
  title: string;
  price_per_day: number;
  location: string;
  rating: number;
  reviews: number;
  image_url: string;
  category: string;
  trust_level: 'bronze' | 'silver' | 'gold';
}

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
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0] as const
    }
  }
} as const;

const FeaturedItems = () => {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('rating', { ascending: false })
        .limit(4);
      
      if (!error && data) {
        setItems(data);
      }
      setLoading(false);
    };

    fetchItems();

    const subscription = supabase
      .channel('items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-8 bg-amber-500" />
              <span className="text-amber-500 font-medium text-sm uppercase tracking-wider">Top Rated</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Items</span>
            </h2>
            <p className="text-lg text-white/50 mt-4 font-normal max-w-lg">
              Hand-picked premium rentals from verified users across your campus.
            </p>
          </div>
          <a href="/browse" className="group">
            <button className="relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-12 px-8 py-2 bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-amber-500/50">
              Explore All Items 
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowRight className="w-4 h-4 text-amber-500" />
              </motion.div>
            </button>
          </a>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            <span className="text-white/40 text-sm font-medium animate-pulse">Curating the best for you...</span>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {items.map((item) => (
              <motion.a 
                key={item.id} 
                href={`/item/${item.id}`} 
                variants={itemVariants}
                className="group"
              >
                <div 
                  data-slot="card" 
                  className="flex flex-col h-full rounded-2xl border border-white/5 bg-[#121212] shadow-2xl transition-all duration-500 overflow-hidden hover:border-amber-500/40 hover:shadow-amber-500/5 cursor-pointer group-hover:-translate-y-2"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                      <Image
                        src={item.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
                        }}
                      />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    
                    <div className="absolute top-4 left-4 z-10">
                      <TrustBadge level={item.trust_level || 'bronze'} size="sm" />
                    </div>
                    
                    <div className="absolute top-4 right-4 z-10 backdrop-blur-md bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <span className="text-amber-400 font-bold text-base">₹{item.price_per_day}</span>
                      <span className="text-white/70 text-xs font-medium">/day</span>
                    </div>

                    {/* Quick View Button on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-amber-500 text-black px-6 py-2.5 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl flex items-center gap-2">
                        View Details <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div data-slot="card-content" className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-500/80">{item.category}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-white/40 text-sm mb-4">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5">
                        <MapPin className="w-3 h-3" />
                      </div>
                      <span className="line-clamp-1 font-medium">{item.location}</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < Math.floor(item.rating) ? 'text-amber-400 fill-amber-400' : 'text-white/10'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-white font-bold text-sm ml-1">{item.rating}</span>
                        <span className="text-white/30 text-xs">({item.reviews})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FeaturedItems;
