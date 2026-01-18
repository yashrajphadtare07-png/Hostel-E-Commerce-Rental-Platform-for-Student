"use client";

import React, { useEffect, useState } from 'react';
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Profile {
  walletBalance: number;
  upiId: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'earning' | 'withdrawal' | 'payment';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: any;
}

export default function WalletPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        fetchWalletData(firebaseUser.uid);
      } else {
        window.location.href = '/login';
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchWalletData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile({
          walletBalance: userData.walletBalance || 0,
          upiId: userData.upiId || 'Not linked'
        });
      }

      const transQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const transSnapshot = await getDocs(transQuery);
      const transData = transSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(transData);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
    setLoading(false);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0 || amount > (profile?.walletBalance || 0)) return;

    setWithdrawing(true);
    
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: amount,
        type: 'withdrawal',
        status: 'completed',
        description: `Withdrawal to ${profile?.upiId}`,
        createdAt: serverTimestamp()
      });

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const currentBalance = userDoc.data().walletBalance || 0;
        await updateDoc(userRef, {
          walletBalance: currentBalance - amount
        });
      }

      setWithdrawAmount('');
      fetchWalletData(user.uid);
    } catch (error) {
      console.error('Error processing withdrawal:', error);
    }

    setWithdrawing(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">My Wallet</h1>
          <p className="text-white/50">Manage your earnings and withdrawals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="md:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <span className="text-white/80 font-medium">Available Balance</span>
              </div>
              <div className="text-5xl font-bold text-white mb-2">
                ₹{profile?.walletBalance?.toLocaleString() || '0'}
              </div>
              <div className="text-white/70 text-sm">
                Linked UPI: {profile?.upiId || 'Not linked'}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-center">
              <h3 className="text-white font-semibold mb-4 text-center">Withdraw Funds</h3>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">₹</span>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) > (profile?.walletBalance || 0)}
                  className="w-full h-11 bg-white text-black font-bold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {withdrawing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Withdraw Now'}
                </button>
              </form>
            </div>
          </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Transaction History</h2>
            <Clock className="w-5 h-5 text-white/30" />
          </div>

          {transactions.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-white/30">No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {transactions.map((t) => (
                <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        t.type === 'earning' ? 'bg-emerald-500/10 text-emerald-500' : 
                        t.type === 'withdrawal' ? 'bg-amber-500/10 text-amber-500' : 
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {t.type === 'earning' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-white font-medium">{t.description}</p>
                        <p className="text-white/40 text-xs">
                          {t.createdAt?.toDate ? new Date(t.createdAt.toDate()).toLocaleDateString() : 'Just now'} • {t.createdAt?.toDate ? new Date(t.createdAt.toDate()).toLocaleTimeString() : ''}
                        </p>
                      </div>
                    </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      t.type === 'earning' ? 'text-emerald-500' : 'text-white'
                    }`}>
                      {t.type === 'earning' ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      {t.status === 'completed' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                      )}
                      <span className={`text-[10px] uppercase tracking-wider font-bold ${
                        t.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
