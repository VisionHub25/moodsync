import { useState, useEffect, useCallback } from 'react';
import { supabase, Streak } from '../lib/supabase';

interface UseStreakReturn {
  streak: Streak | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useStreak(): UseStreakReturn {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreak = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Nicht eingeloggt');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Check if streak is still valid (not broken)
      if (data) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        if (data.last_checkin !== today && data.last_checkin !== yesterday) {
          // Streak is broken, reset it
          const { data: updatedStreak } = await supabase
            .from('streaks')
            .update({ current_streak: 0 })
            .eq('user_id', user.id)
            .select()
            .single();
          
          setStreak(updatedStreak);
          return;
        }
      }

      setStreak(data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return {
    streak,
    isLoading,
    error,
    refresh: fetchStreak,
  };
}
