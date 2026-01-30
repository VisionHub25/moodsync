import { useState, useEffect, useCallback } from 'react';
import { supabase, Checkin, isSupabaseConfigured } from '../lib/supabase';

interface DayData {
  date: string;
  score: number;
  emoji: string;
  tags: string[];
}

interface TagCorrelation {
  tag: string;
  avgScore: number;
  count: number;
}

interface Insights {
  weekData: DayData[];
  monthData: DayData[];
  tagCorrelations: TagCorrelation[];
  bestDay: string | null;
  worstDay: string | null;
  averageScore: number;
  totalCheckins: number;
}

interface UseInsightsReturn {
  insights: Insights | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DAYS_OF_WEEK = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

// Generate demo insights data
function generateDemoInsights(): Insights {
  const emojis = ['😊', '😌', '🙂', '😢', '😤', '🥰', '😴'];
  const tags = ['work', 'family', 'exercise', 'sleep', 'friends'];

  const weekData: DayData[] = [];
  const monthData: DayData[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const score = 0.3 + Math.random() * 0.6;

    const dayData = {
      date: dateStr,
      score,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      tags: tags.slice(0, Math.floor(Math.random() * 3) + 1),
    };

    monthData.push(dayData);
    if (i < 7) weekData.push(dayData);
  }

  return {
    weekData,
    monthData,
    tagCorrelations: [
      { tag: 'exercise', avgScore: 0.85, count: 8 },
      { tag: 'friends', avgScore: 0.78, count: 6 },
      { tag: 'family', avgScore: 0.72, count: 10 },
      { tag: 'work', avgScore: 0.55, count: 15 },
      { tag: 'sleep', avgScore: 0.48, count: 5 },
    ],
    bestDay: 'Samstag',
    worstDay: 'Montag',
    averageScore: 0.68,
    totalCheckins: 25,
  };
}

export function useInsights(): UseInsightsReturn {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    // Demo mode - return mock data
    if (!isSupabaseConfigured()) {
      setInsights(generateDemoInsights());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Nicht eingeloggt');
        return;
      }

      // Get last 30 days of checkins
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: checkins, error: fetchError } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      if (!checkins || checkins.length === 0) {
        setInsights({
          weekData: [],
          monthData: [],
          tagCorrelations: [],
          bestDay: null,
          worstDay: null,
          averageScore: 0,
          totalCheckins: 0,
        });
        return;
      }

      // Process checkins into day data
      const dayDataMap = new Map<string, DayData>();
      
      checkins.forEach((checkin: Checkin) => {
        const date = checkin.created_at.split('T')[0];
        dayDataMap.set(date, {
          date,
          score: checkin.sentiment_score,
          emoji: checkin.emoji,
          tags: checkin.tags,
        });
      });

      const allDayData = Array.from(dayDataMap.values());
      
      // Last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weekData = allDayData.filter(d => new Date(d.date) >= sevenDaysAgo);

      // Tag correlations
      const tagScores = new Map<string, { total: number; count: number }>();
      checkins.forEach((checkin: Checkin) => {
        checkin.tags.forEach(tag => {
          const current = tagScores.get(tag) || { total: 0, count: 0 };
          tagScores.set(tag, {
            total: current.total + checkin.sentiment_score,
            count: current.count + 1,
          });
        });
      });

      const tagCorrelations: TagCorrelation[] = Array.from(tagScores.entries())
        .map(([tag, { total, count }]) => ({
          tag,
          avgScore: total / count,
          count,
        }))
        .sort((a, b) => b.avgScore - a.avgScore);

      // Best/worst day of week
      const dayOfWeekScores = new Map<number, { total: number; count: number }>();
      checkins.forEach((checkin: Checkin) => {
        const day = new Date(checkin.created_at).getDay();
        const current = dayOfWeekScores.get(day) || { total: 0, count: 0 };
        dayOfWeekScores.set(day, {
          total: current.total + checkin.sentiment_score,
          count: current.count + 1,
        });
      });

      let bestDay: string | null = null;
      let worstDay: string | null = null;
      let bestScore = -1;
      let worstScore = 2;

      dayOfWeekScores.forEach(({ total, count }, day) => {
        const avg = total / count;
        if (avg > bestScore) {
          bestScore = avg;
          bestDay = DAYS_OF_WEEK[day];
        }
        if (avg < worstScore) {
          worstScore = avg;
          worstDay = DAYS_OF_WEEK[day];
        }
      });

      // Average score
      const totalScore = checkins.reduce((sum: number, c: Checkin) => sum + c.sentiment_score, 0);
      const averageScore = totalScore / checkins.length;

      setInsights({
        weekData,
        monthData: allDayData,
        tagCorrelations,
        bestDay,
        worstDay,
        averageScore,
        totalCheckins: checkins.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    isLoading,
    error,
    refresh: fetchInsights,
  };
}
