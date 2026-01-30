import { useState, useEffect, useCallback } from 'react';
import { supabase, Buddy, Profile } from '../lib/supabase';

interface BuddyWithProfile {
  oddy: Buddy;
  profile: Profile;
  todayMood: { emoji: string; score: number } | null;
}

interface UseBuddiesReturn {
  buddies: BuddyWithProfile[];
  pendingRequests: BuddyWithProfile[];
  isLoading: boolean;
  error: string | null;
  sendRequest: (username: string) => Promise<boolean>;
  acceptRequest: (buddyUserId: string) => Promise<boolean>;
  rejectRequest: (buddyUserId: string) => Promise<boolean>;
  removeBuddy: (buddyUserId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const MAX_BUDDIES = 3;

export function useBuddies(): UseBuddiesReturn {
  const [buddies, setBuddies] = useState<BuddyWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<BuddyWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBuddies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Nicht eingeloggt');
        return;
      }

      // Get all buddy relationships involving this user
      const { data: buddyData, error: buddyError } = await supabase
        .from('buddies')
        .select('*')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

      if (buddyError) throw buddyError;

      if (!buddyData || buddyData.length === 0) {
        setBuddies([]);
        setPendingRequests([]);
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      // Process each buddy relationship
      const processedBuddies: BuddyWithProfile[] = [];
      const processedPending: BuddyWithProfile[] = [];

      for (const buddy of buddyData) {
        const otherUserId = buddy.user_a === user.id ? buddy.user_b : buddy.user_a;
        
        // Get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherUserId)
          .single();

        if (!profile) continue;

        // Get today's mood (only if accepted)
        let todayMood = null;
        if (buddy.status === 'accepted') {
          const { data: checkin } = await supabase
            .from('checkins')
            .select('emoji, sentiment_score')
            .eq('user_id', otherUserId)
            .gte('created_at', `${today}T00:00:00`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (checkin) {
            todayMood = { emoji: checkin.emoji, score: checkin.sentiment_score };
          }
        }

        const buddyWithProfile: BuddyWithProfile = {
          buddy,
          profile,
          todayMood,
        };

        if (buddy.status === 'accepted') {
          processedBuddies.push(buddyWithProfile);
        } else if (buddy.status === 'pending' && buddy.user_b === user.id) {
          // Only show pending requests where we are the recipient
          processedPending.push(buddyWithProfile);
        }
      }

      setBuddies(processedBuddies);
      setPendingRequests(processedPending);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuddies();
  }, [fetchBuddies]);

  const sendRequest = useCallback(async (username: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Nicht eingeloggt');
        return false;
      }

      // Check buddy limit
      if (buddies.length >= MAX_BUDDIES) {
        setError(`Du kannst maximal ${MAX_BUDDIES} Buddies haben`);
        return false;
      }

      // Find user by username
      const { data: targetProfile, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .single();

      if (findError || !targetProfile) {
        setError('User nicht gefunden');
        return false;
      }

      if (targetProfile.id === user.id) {
        setError('Du kannst dich nicht selbst adden');
        return false;
      }

      // Ensure consistent ordering (smaller UUID first)
      const [userA, userB] = [user.id, targetProfile.id].sort();

      // Check if relationship already exists
      const { data: existing } = await supabase
        .from('buddies')
        .select('status')
        .eq('user_a', userA)
        .eq('user_b', userB)
        .single();

      if (existing) {
        setError(existing.status === 'accepted' ? 'Ihr seid bereits Buddies' : 'Anfrage bereits gesendet');
        return false;
      }

      // Create buddy request
      const { error: insertError } = await supabase
        .from('buddies')
        .insert({
          user_a: userA,
          user_b: userB,
          status: 'pending',
        });

      if (insertError) throw insertError;

      await fetchBuddies();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Senden');
      return false;
    }
  }, [buddies.length, fetchBuddies]);

  const acceptRequest = useCallback(async (buddyUserId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Nicht eingeloggt');
        return false;
      }

      if (buddies.length >= MAX_BUDDIES) {
        setError(`Du kannst maximal ${MAX_BUDDIES} Buddies haben`);
        return false;
      }

      const [userA, userB] = [user.id, buddyUserId].sort();

      const { error: updateError } = await supabase
        .from('buddies')
        .update({ status: 'accepted' })
        .eq('user_a', userA)
        .eq('user_b', userB);

      if (updateError) throw updateError;

      await fetchBuddies();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Akzeptieren');
      return false;
    }
  }, [buddies.length, fetchBuddies]);

  const rejectRequest = useCallback(async (buddyUserId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Nicht eingeloggt');
        return false;
      }

      const [userA, userB] = [user.id, buddyUserId].sort();

      const { error: deleteError } = await supabase
        .from('buddies')
        .delete()
        .eq('user_a', userA)
        .eq('user_b', userB);

      if (deleteError) throw deleteError;

      await fetchBuddies();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Ablehnen');
      return false;
    }
  }, [fetchBuddies]);

  const removeBuddy = useCallback(async (buddyUserId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Nicht eingeloggt');
        return false;
      }

      const [userA, userB] = [user.id, buddyUserId].sort();

      const { error: deleteError } = await supabase
        .from('buddies')
        .delete()
        .eq('user_a', userA)
        .eq('user_b', userB);

      if (deleteError) throw deleteError;

      await fetchBuddies();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Entfernen');
      return false;
    }
  }, [fetchBuddies]);

  return {
    buddies,
    pendingRequests,
    isLoading,
    error,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeBuddy,
    refresh: fetchBuddies,
  };
}
