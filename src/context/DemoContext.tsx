import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Checkin, Streak } from '../lib/supabase';

interface DemoContextType {
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
  demoCheckins: Checkin[];
  addDemoCheckin: (checkin: Partial<Checkin>) => Checkin;
  demoStreak: Streak;
}

const DemoContext = createContext<DemoContextType | null>(null);

// Generate some mock checkins for demo
const generateMockCheckins = (): Checkin[] => {
  const emojis = ['😊', '😌', '😢', '😤', '🥰', '😴', '🤔'];
  const checkins: Checkin[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    checkins.push({
      id: `demo-${i}`,
      user_id: 'demo-user',
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      sentiment_score: Math.random(),
      tags: ['work', 'family'].slice(0, Math.floor(Math.random() * 3)),
      created_at: date.toISOString(),
    });
  }

  return checkins;
};

interface DemoProviderProps {
  children: ReactNode;
  initialDemoMode?: boolean;
}

export function DemoProvider({ children, initialDemoMode = false }: DemoProviderProps) {
  const [isDemoMode, setDemoMode] = useState(initialDemoMode);
  const [demoCheckins, setDemoCheckins] = useState<Checkin[]>(generateMockCheckins());
  const [demoStreak, setDemoStreak] = useState<Streak>({
    user_id: 'demo-user',
    current_streak: 5,
    longest_streak: 12,
    last_checkin: new Date().toISOString().split('T')[0],
  });

  const addDemoCheckin = (checkin: Partial<Checkin>): Checkin => {
    const newCheckin: Checkin = {
      id: `demo-${Date.now()}`,
      user_id: 'demo-user',
      emoji: checkin.emoji || '😊',
      sentiment_score: checkin.sentiment_score || 0.5,
      tags: checkin.tags || [],
      created_at: new Date().toISOString(),
    };

    setDemoCheckins(prev => [...prev, newCheckin]);
    setDemoStreak(prev => ({
      ...prev,
      current_streak: prev.current_streak + 1,
      longest_streak: Math.max(prev.longest_streak, prev.current_streak + 1),
      last_checkin: new Date().toISOString().split('T')[0],
    }));

    return newCheckin;
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, setDemoMode, demoCheckins, addDemoCheckin, demoStreak }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
