"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  full_name: string;
  college: string;
  trust_level: string;
  wallet_balance: number;
  email?: string;
}

async function syncUser(user: User): Promise<UserProfile | null> {
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.uid)
    .single();

  if (existingProfile && !fetchError) {
    const updates: Partial<UserProfile> = {};
    if (user.email && existingProfile.email !== user.email) {
      updates.email = user.email;
    }
    if (user.displayName && existingProfile.full_name !== user.displayName) {
      updates.full_name = user.displayName;
    }

    if (Object.keys(updates).length > 0) {
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.uid)
        .select()
        .single();
      return updatedProfile as UserProfile;
    }
    return existingProfile as UserProfile;
  }

  const newProfile = {
    id: user.uid,
    full_name: user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    college: '',
    trust_level: 'New',
    wallet_balance: 0,
    total_rentals: 0,
    on_time_returns: 0,
    damage_free: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: createdProfile, error: insertError } = await supabase
    .from('profiles')
    .insert(newProfile)
    .select()
    .single();

  if (insertError) {
    console.error('Error creating profile:', insertError);
    return null;
  }

  return createdProfile as UserProfile;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userProfile = await syncUser(currentUser);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, loading };
}
