"use client";

import React, { useState } from 'react';
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import { Mail, Lock, Loader2, School, User } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { supabase } from '@/lib/supabase';

const COLLEGES = [
  "Savitribai Phule Pune University (SPPU)",
  "COEP Technological University",
  "Pune Institute of Computer Technology (PICT)",
  "VIT Pune",
  "Sinhgad College of Engineering",
  "MIT World Peace University",
  "Symbiosis Institute of Technology",
  "Fergusson College",
  "Bharati Vidyapeeth College of Engineering",
  "D.Y. Patil College of Engineering (Pune)",
  "Vishwakarma Institute of Technology",
  "Cummins College of Engineering for Women",
  "AISSMS College of Engineering",
  "Modern Education Society's College of Engineering",
  "MAEER's MIT College of Engineering",
  "Vidya Pratishthan's College of Engineering (Baramati)",
  "Sinhgad Academy of Engineering (Kondhwa)",
  "Sinhgad College of Engineering (Vadgaon)",
  "Indira College of Engineering (Pune)",
  "AGI's Sanjay Ghodawat University (Kolhapur - nearby)"
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState(COLLEGES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess('');
  
        try {
          if (isSignUp) {
            if (!fullName.trim()) {
              throw new Error('Please enter your full name');
            }

            // Validate college email domain
            const collegeDomains = ['.edu', '.ac.in', '.edu.in', '.org', 'campusrent.com'];
            const isCollegeEmail = collegeDomains.some(domain => email.toLowerCase().endsWith(domain));
            if (!isCollegeEmail) {
              throw new Error('Please use a verified college email ID (e.g., .edu, .ac.in, or .org)');
            }
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await updateProfile(user, {
              displayName: fullName
            });
            
            if (user) {
              const { error: profileError } = await supabase
                .from('profiles')
                .upsert({ 
                  id: user.uid,
                  college: college,
                  full_name: fullName,
                  trust_level: 'bronze',
                  wallet_balance: 100, // Give some starter balance
                  total_rentals: 0,
                  on_time_returns: 0,
                  damage_free: 0
                });
              if (profileError) console.error('Error creating profile:', profileError);
            }
            
            setSuccess('Account created successfully! Redirecting...');
            setTimeout(() => {
              window.location.href = '/';
            }, 1500);
          } else {
            try {
              await signInWithEmailAndPassword(auth, email, password);
              window.location.href = '/';
            } catch (err: any) {
              // If account doesn't exist and it's the demo account, auto-signup
              if (email === 'demo@campusrent.com' && (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found')) {
                setIsSignUp(true);
                setFullName('Demo User');
                setCollege(COLLEGES[0]);
                setError('Demo account not found. Click "Sign Up" to create it instantly with demo credentials.');
                return;
              }

              if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
                throw new Error('Invalid email or password. If you haven\'t created an account yet, please use the Sign Up tab.');
              }
              throw err;
            }
          }
        } catch (err: any) {
          setError(err.message);
        }
  
      setLoading(false);
    };


  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-white/50">
              {isSignUp ? 'Sign up to start renting' : 'Login to your CampusRent account'}
            </p>
          </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">College</label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <select
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-white appearance-none focus:outline-none focus:border-amber-400/50 cursor-pointer"
                      required
                    >
                      {COLLEGES.map((c) => (
                        <option key={c} value={c} className="bg-[#1a1a1a]">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name.branch.year@college.org"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/50"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  {success}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isSignUp ? 'Sign Up' : 'Login')}
                </button>
                
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('demo@campusrent.com');
                      setPassword('demo123');
                    }}
                    className="w-full h-12 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all"
                  >
                    Use Demo Credentials
                  </button>
                )}
              </div>
            </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-amber-400 hover:text-amber-300 text-sm"
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
