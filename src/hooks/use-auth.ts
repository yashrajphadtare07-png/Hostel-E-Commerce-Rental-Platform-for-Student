import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';

export interface UserProfile {
  id: string;
  full_name: string;
  college: string;
  trust_level: string;
  wallet_balance: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch Supabase profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', firebaseUser.uid)
          .single();
        
        if (!error && data) {
          setProfile(data);
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    setLoading(true);
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  return { user, profile, loading, signOut };
}
