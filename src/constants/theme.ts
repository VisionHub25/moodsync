// MoodSync Design System
// Based on UX Wireframes v1.0

export const COLORS = {
  // Primary palette
  primary: '#6C5CE7',      // Soft Purple - calming, not clinical
  primaryLight: '#A29BFE',
  primaryDark: '#5541D7',
  
  // Secondary palette
  secondary: '#00CEC9',    // Teal - fresh, positive
  secondaryLight: '#81ECEC',
  
  // Backgrounds
  background: '#F8F9FA',   // Light gray - easy on eyes
  surface: '#FFFFFF',
  
  // Text
  textPrimary: '#2D3436',  // Dark gray - readable
  textSecondary: '#636E72',
  textMuted: '#B2BEC3',
  
  // Mood Scale Colors
  mood: {
    1: '#E17055', // Coral - sad
    2: '#FDCB6E', // Yellow - meh
    3: '#B2BEC3', // Gray - neutral
    4: '#81ECEC', // Light Teal - good
    5: '#55EFC4', // Mint Green - great
  },
  
  // Semantic
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#E17055',
  
  // Borders
  border: '#DFE6E9',
  borderLight: '#F1F3F5',
};

export const SPACING = {
  xs: 4,
  sm: 8,    // Base unit
  md: 16,   // 2 units
  lg: 24,   // 3 units
  xl: 32,   // 4 units
  xxl: 48,  // 6 units
};

export const RADIUS = {
  sm: 8,
  md: 12,   // Card radius
  lg: 16,
  xl: 24,
  full: 9999,
};

export const TYPOGRAPHY = {
  // Headers
  h1: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: COLORS.textPrimary,
  },
  h2: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: COLORS.textPrimary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
  },
  // Body
  body: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  bodySmall: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
};

// Simplified 5-emoji mood scale (per UX spec)
export const MOOD_EMOJIS_V2 = [
  { emoji: '😢', label: 'Schlecht', score: 1, color: COLORS.mood[1] },
  { emoji: '😕', label: 'Meh', score: 2, color: COLORS.mood[2] },
  { emoji: '😐', label: 'Neutral', score: 3, color: COLORS.mood[3] },
  { emoji: '🙂', label: 'Gut', score: 4, color: COLORS.mood[4] },
  { emoji: '😊', label: 'Super', score: 5, color: COLORS.mood[5] },
] as const;

export type MoodScore = 1 | 2 | 3 | 4 | 5;
