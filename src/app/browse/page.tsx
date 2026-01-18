"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { MapPin, Star, Loader2, Search, Filter, GraduationCap, Grid3X3, List, SlidersHorizontal, ChevronDown, X, IndianRupee } from 'lucide-react';
import Image from 'next/image';
import { TrustBadge } from '@/components/ui/trust-badge';
import { motion, AnimatePresence } from 'framer-motion';

type YearFilter = 'all' | 'FY' | 'SY' | 'TY' | 'Final';
type SortOption = 'newest' | 'price_low' | 'price_high' | 'rating' | 'reviews';
type ViewMode = 'grid' | 'list';

interface Item {
  id: string;
  title: string;
  description: string;
  price_per_day: number;
  location: string;
  rating: number;
  reviews: number;
  image_url: string;
  category: string;
  trust_level: 'bronze' | 'silver' | 'gold';
  target_year: string;
  college: string;
  created_at: string;
}

const yearLabels: Record<YearFilter, string> = {
  all: 'All Years',
  FY: 'First Year',
  SY: 'Second Year',
  TY: 'Third Year',
  Final: 'Final Year',
};

const yearDescriptions: Record<YearFilter, string> = {
  all: 'Browse all available items',
  FY: 'Calculators, drawing kits, lab manuals',
  SY: 'Data structures, core subject books',
  TY: 'Project kits, Arduino, Raspberry Pi',
  Final: 'Interview books, formal wear, placement prep',
};

const sortOptions: Record<SortOption, string> = {
  newest: 'Newest First',
  price_low: 'Price: Low to High',
  price_high: 'Price: High to Low',
  rating: 'Highest Rated',
  reviews: 'Most Reviews',
};

const CATEGORIES = ['all', 'Books', 'Electronics', 'Sports', 'Music', 'Photography', 'Kitchen', 'Appliances', 'Accessories', 'Study', 'Fashion', 'Other'];

const PRICE_RANGES = [
  { label: 'Any Price', min: 0, max: Infinity },
  { label: 'Under ₹50', min: 0, max: 50 },
  { label: '₹50 - ₹100', min: 50, max: 100 },
  { label: '₹100 - ₹200', min: 100, max: 200 },
  { label: '₹200 - ₹500', min: 200, max: 500 },
  { label: 'Above ₹500', min: 500, max: Infinity },
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [yearFilter, setYearFilter] = useState<YearFilter>((searchParams.get('year') as YearFilter) || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [priceRange, setPriceRange] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    let count = 0;
    if (yearFilter !== 'all') count++;
    if (category !== 'all') count++;
    if (priceRange !== 0) count++;
    setActiveFiltersCount(count);
  }, [yearFilter, category, priceRange]);

  useEffect(() => {
    const itemsRef = collection(db, 'items');
    const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Item[];
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      console.error('Firestore error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredAndSortedItems = React.useMemo(() => {
    let result = [...items];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.college?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower)
      );
    }

    if (yearFilter !== 'all') {
      result = result.filter(item => 
        item.target_year === yearFilter || 
        item.target_year === 'all' || 
        item.target_year === 'Any Year'
      );
    }

    if (category !== 'all') {
      result = result.filter(item => item.category === category);
    }

    const { min, max } = PRICE_RANGES[priceRange];
    if (min > 0 || max !== Infinity) {
      result = result.filter(item => {
        const price = Number(item.price_per_day);
        return price >= min && price <= max;
      });
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'price_low':
        result.sort((a, b) => Number(a.price_per_day) - Number(b.price_per_day));
        break;
      case 'price_high':
        result.sort((a, b) => Number(b.price_per_day) - Number(a.price_per_day));
        break;
      case 'rating':
        result.sort((a, b) => Number(b.rating) - Number(a.rating));
        break;
      case 'reviews':
        result.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return result;
  }, [items, search, yearFilter, category, priceRange, sortBy]);

  const clearAllFilters = () => {
    setYearFilter('all');
    setCategory('all');
    setPriceRange(0);
    setSearch('');
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Browse Items</h1>
        <p className="text-white/50">Find exactly what you need for your semester</p>
      </div>

      {/* Search and Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            placeholder="Search items, colleges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50 transition-all"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-12 px-5 rounded-xl flex items-center gap-2 font-medium transition-all ${
              showFilters || activeFiltersCount > 0
                ? 'bg-amber-500 text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-black/20 text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-12 bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 text-white appearance-none cursor-pointer focus:outline-none focus:border-amber-400/50 text-sm"
            >
              {Object.entries(sortOptions).map(([key, label]) => (
                <option key={key} value={key} className="bg-[#111]">{label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>

          <div className="hidden sm:flex h-12 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 flex items-center justify-center transition-all ${
                viewMode === 'grid' ? 'bg-amber-500 text-black' : 'text-white/50 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 flex items-center justify-center transition-all ${
                viewMode === 'list' ? 'bg-amber-500 text-black' : 'text-white/50 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
              {/* Year Filter */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-white/70">Student Year</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(yearLabels) as YearFilter[]).map((year) => (
                    <button
                      key={year}
                      onClick={() => setYearFilter(year)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        yearFilter === year
                          ? 'bg-amber-500 text-black'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                      }`}
                    >
                      {yearLabels[year]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-white/70">Category</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        category === cat
                          ? 'bg-amber-500 text-black'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                      }`}
                    >
                      {cat === 'all' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <IndianRupee className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-white/70">Price Range (per day)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((range, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPriceRange(idx)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        priceRange === idx
                          ? 'bg-amber-500 text-black'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-amber-400 text-sm font-medium hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-sm">
          {filteredAndSortedItems.length} item{filteredAndSortedItems.length !== 1 ? 's' : ''} found
        </p>
        {activeFiltersCount > 0 && !showFilters && (
          <button
            onClick={clearAllFilters}
            className="text-amber-400 text-sm font-medium hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/50 text-lg mb-2">No items found</p>
          <p className="text-white/30 text-sm mb-6">Try adjusting your filters or search terms</p>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="px-6 py-2 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-all"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredAndSortedItems.map((item) => (
              <motion.a 
                key={item.id} 
                href={`/item/${item.id}`} 
                className="group"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col rounded-xl border border-white/5 bg-white/5 shadow-sm transition-all overflow-hidden hover:border-amber-500/30 cursor-pointer hover:shadow-[0_0_20px_rgba(251,191,36,0.1)]">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <TrustBadge level={item.trust_level || 'bronze'} size="sm" />
                      {item.target_year && item.target_year !== 'all' && item.target_year !== 'Any Year' && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-400 text-[10px] font-bold uppercase">
                          {item.target_year}
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-0.5">
                      <span className="text-amber-400 font-semibold text-[14px]">₹{Number(item.price_per_day)}</span>
                      <span className="text-white/60 text-xs">/day</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-[16px] font-semibold text-white mb-2 line-clamp-1">
                      {item.title}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-white/50 text-sm mb-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="line-clamp-1">{item.college || item.location}</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-white font-medium text-[14px]">{Number(item.rating).toFixed(1)}</span>
                        <span className="text-white/40 text-sm">({item.reviews})</span>
                      </div>
                      <span className="text-white/50 text-sm font-normal truncate max-w-[80px]">{item.category}</span>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div layout className="space-y-4">
          <AnimatePresence>
            {filteredAndSortedItems.map((item) => (
              <motion.a
                key={item.id}
                href={`/item/${item.id}`}
                className="group block"
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:border-amber-500/30 transition-all hover:shadow-[0_0_20px_rgba(251,191,36,0.1)]">
                  <div className="relative w-full sm:w-48 h-36 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="200px"
                    />
                    <div className="absolute top-2 left-2">
                      <TrustBadge level={item.trust_level || 'bronze'} size="sm" />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-white line-clamp-1">{item.title}</h3>
                        <div className="flex items-baseline gap-0.5 shrink-0">
                          <span className="text-amber-400 font-bold text-xl">₹{Number(item.price_per_day)}</span>
                          <span className="text-white/50 text-sm">/day</span>
                        </div>
                      </div>
                      <p className="text-white/50 text-sm line-clamp-2 mb-3">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-white/40 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {item.college || item.location}
                        </span>
                        <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">{item.category}</span>
                        {item.target_year && item.target_year !== 'all' && item.target_year !== 'Any Year' && (
                          <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded text-xs uppercase font-medium">
                            {item.target_year}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-white font-medium">{Number(item.rating).toFixed(1)}</span>
                        <span className="text-white/40">({item.reviews})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <Suspense fallback={
        <div className="pt-24 flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      }>
        <BrowseContent />
      </Suspense>
      <Footer />
    </main>
  );
}
