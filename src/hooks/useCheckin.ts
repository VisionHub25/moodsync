import { useState, useCallback } from 'react';
import { supabase, Checkin } from '../lib/supabase';
import { MoodEmoji, MoodTagId } from '../constants/tags';

interface CheckinData {
  emoji: MoodEmoji;
  sentimentScore: number;
  tags: MoodTagId[];
  note?: string;
}

interface UseCheckinReturn {
  isLoading: boolean;
  error: string | null;
  submitCheckin: (data: CheckinData) => Promise<Checkin | null>;
  todayCheckin: Checkin | null;
  fetchTodayCheckin: () => Promise<void>;
}

export function useCheckin(): UseCheckinReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayCheckin, setTodayCheckin] = useState<Checkin | null>(null);

  const fetchTodayCheckin = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Nicht eingeloggt');
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error: fetchError } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is fine
        throw fetchError;
      }

      setTodayCheckin(data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitCheckin = useCallback(async (data: CheckinData): Promise<Checkin | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Nicht eingeloggt');
        return null;
      }

      const checkinData = {
        user_id: user.id,
        emoji: data.emoji,
        sentiment_score: data.sentimentScore,
        tags: data.tags,
        // Note is NOT sent to server - privacy first!
      };

      const { data: newCheckin, error: insertError } = await supabase
        .from('checkins')
        .insert(checkinData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Update streak
      await updateStreak(user.id);

      setTodayCheckin(newCheckin);
      return newCheckin;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    submitCheckin,
    todayCheckin,
    fetchTodayCheckin,
  };
}

async function updateStreak(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Get current streak
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!streak) {
    // Create new streak
    await supabase.from('streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_checkin: today,
    });
    return;
  }

  // Check if already checked in today
  if (streak.last_checkin === today) {
    return; // No update needed
  }

  // Calculate new streak
  const newStreak = streak.last_checkin === yesterday
    ? streak.current_streak + 1
    : 1; // Reset if not consecutive

  const newLongest = Math.max(newStreak, streak.longest_streak);

  await supabase
    .from('streaks')
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_checkin: today,
    })
    .eq('user_id', userId);
}
