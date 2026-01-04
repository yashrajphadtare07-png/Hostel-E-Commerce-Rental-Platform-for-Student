"use client";

import React, { useEffect, useState, use } from 'react';
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import { supabase } from '@/lib/supabase';
import { MapPin, Star, Info, Loader2, Copy, CheckCircle2, User } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrustBadge } from '@/components/ui/trust-badge';

const MOCK_RENTER_ID = '00000000-0000-0000-0000-000000000000';
const PLATFORM_UPI = 'campusrent@upi';

interface Item {
  id: number;
  title: string;
  description: string;
  price_per_day: number;
  location: string;
  rating: number;
  reviews: number;
  image_url: string;
  category: string;
  owner_id: string;
  trust_level: 'bronze' | 'silver' | 'gold';
  target_year: string;
  college: string;
}

interface OwnerProfile {
  full_name: string;
  trust_level: 'bronze' | 'silver' | 'gold';
  total_rentals: number;
  on_time_returns: number;
  damage_free: number;
}

export default function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<Item | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [upiRef, setUpiRef] = useState('');
  const [renting, setRenting] = useState(false);
  const [rented, setRented] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userCollege, setUserCollege] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setItem(data);
        
        const { data: ownerData } = await supabase
          .from('profiles')
          .select('full_name, trust_level, total_rentals, on_time_returns, damage_free')
          .eq('id', data.owner_id)
          .single();
        
        if (ownerData) setOwner(ownerData);
      }

      // Fetch current user college
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        const { data: profile } = await supabase
          .from('profiles')
          .select('college')
          .eq('id', user.id)
          .single();
        if (profile) setUserCollege(profile.college);
      } else {
        setIsLoggedIn(false);
      }

      setLoading(false);
    };

    fetchItem();
  }, [id]);

  const handleRent = async () => {
    if (!item || !upiRef) return;
    
    // Safety check again
    if (userCollege && item.college && userCollege !== item.college) {
      alert("You can only rent items from your own college.");
      return;
    }

    setRenting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    const renterId = user?.id || MOCK_RENTER_ID;

    const totalAmount = Number(item.price_per_day);
    const serviceFee = totalAmount * 0.1;
    const ownerEarning = totalAmount * 0.9;

    const { error: rentalError } = await supabase.from('rentals').insert({
      item_id: item.id,
      renter_id: renterId,
      owner_id: item.owner_id,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      total_amount: totalAmount,
      service_fee: serviceFee,
      owner_earning: ownerEarning,
      status: 'paid',
      upi_reference: upiRef,
    });

    if (!rentalError) {
      const { data: ownerProf } = await supabase.from('profiles').select('wallet_balance').eq('id', item.owner_id).single();
      if (ownerProf) {
        await supabase.from('profiles').update({ 
          wallet_balance: Number(ownerProf.wallet_balance) + ownerEarning 
        }).eq('id', item.owner_id);
      }

      await supabase.from('transactions').insert({
        user_id: item.owner_id,
        amount: ownerEarning,
        type: 'earning',
        status: 'completed',
        description: `Earning from rental: ${item.title}`,
      });
    }

    setRenting(false);
    setRented(true);
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(PLATFORM_UPI);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <h1 className="text-white text-2xl">Item not found</h1>
      </main>
    );
  }

  const serviceFee = item.price_per_day * 0.1;
  const totalToPay = item.price_per_day;

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden border border-white/5">
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <TrustBadge level={item.trust_level || 'bronze'} size="md" />
              {item.target_year !== 'all' && (
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-400 text-xs font-bold uppercase">
                  {item.target_year}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-sm font-medium mb-4">
                {item.category}
              </span>
              <h1 className="text-4xl font-bold text-white mb-4">{item.title}</h1>
              <div className="flex items-center gap-6 text-white/60">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-white font-semibold">{item.rating}</span>
                  <span>({item.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-5 h-5" />
                  <span>{item.location}</span>
                </div>
              </div>
            </div>

            {owner && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <User className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{owner.full_name}</p>
                      <p className="text-white/40 text-sm">{owner.total_rentals} successful rentals</p>
                    </div>
                  </div>
                  <TrustBadge level={owner.trust_level || 'bronze'} size="md" />
                </div>
                {owner.total_rentals > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">{Math.round((owner.on_time_returns / owner.total_rentals) * 100)}%</p>
                      <p className="text-white/40 text-xs">On-time Returns</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{Math.round((owner.damage_free / owner.total_rentals) * 100)}%</p>
                      <p className="text-white/40 text-xs">Damage-free</p>
                    </div>
                  </div>
                )}
              </div>
            )}

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8">
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-4xl font-bold text-white">₹{item.price_per_day}</span>
                  <span className="text-white/40 mb-1">/ day</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-white/80">
                    <TrustBadge level={item.trust_level || 'bronze'} size="sm" showLabel={false} />
                    <span>{item.trust_level === 'gold' ? 'Highly Trusted Owner' : item.trust_level === 'silver' ? 'Verified Owner' : 'Campus Owner'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <Info className="w-5 h-5 text-blue-500" />
                    <span>Includes 10% platform service fee</span>
                  </div>
                  {item.college && (
                    <div className="flex items-center gap-3 text-white/80">
                      <MapPin className="w-5 h-5 text-amber-500" />
                      <span>Only available for <span className="text-amber-400 font-bold">{item.college}</span></span>
                    </div>
                  )}
                </div>

                  {!isLoggedIn ? (
                    <Button 
                      asChild
                      className="w-full h-14 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-black rounded-xl transition-all"
                    >
                      <a href="/login">Login to Rent Items</a>
                    </Button>
                  ) : userCollege && item.college && userCollege !== item.college ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-3">
                        <Info className="w-5 h-5 shrink-0" />
                        <p>
                          This item is listed for <span className="font-bold">{item.college}</span>. 
                          You are currently at <span className="font-bold">{userCollege}</span>. 
                          Cross-college rentals are not supported for safety.
                        </p>
                      </div>
                      <Button 
                        disabled
                        className="w-full h-14 text-lg font-bold bg-white/10 text-white/40 rounded-xl cursor-not-allowed"
                      >
                        College Mismatch
                      </Button>
                    </div>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full h-14 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-black rounded-xl transition-all"
                        >
                          Rent Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#111] border-white/10 text-white max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold">Complete Payment</DialogTitle>
                          <DialogDescription className="text-white/60">
                            Pay via UPI to secure your rental
                          </DialogDescription>
                        </DialogHeader>

                        {rented ? (
                          <div className="py-10 text-center space-y-4">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold">Payment Confirmed!</h3>
                            <p className="text-white/60">Your rental request has been sent to the owner. Check your wallet for updates.</p>
                            <Button asChild className="w-full bg-white text-black hover:bg-white/90">
                              <a href="/wallet">Go to Wallet</a>
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-6 py-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-white/50">Rent Amount</span>
                                <span>₹{(item.price_per_day * 0.9).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/50">Service Fee (10%)</span>
                                <span>₹{serviceFee.toFixed(2)}</span>
                              </div>
                              <div className="pt-3 border-t border-white/10 flex justify-between font-bold text-lg">
                                <span>Total to Pay</span>
                                <span className="text-amber-400">₹{totalToPay}</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-sm font-medium text-white/60">Pay to Platform UPI</label>
                              <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
                                <code className="flex-1 text-amber-400 font-mono">{PLATFORM_UPI}</code>
                                <button onClick={copyUPI} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-white/40" />}
                                </button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-sm font-medium text-white/60">UPI Transaction ID / Ref No.</label>
                              <Input
                                placeholder="Enter 12-digit reference number"
                                value={upiRef}
                                onChange={(e) => setUpiRef(e.target.value)}
                                className="bg-white/5 border-white/10 focus:border-amber-400/50"
                              />
                            </div>

                            <Button
                              onClick={handleRent}
                              disabled={!upiRef || renting}
                              className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl"
                            >
                              {renting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Payment'}
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  )}
            </div>

            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
              <p className="text-white/60 leading-relaxed">
                {item.description || "No description available for this item. Contact the owner for more details about the condition and usage of this product."}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
