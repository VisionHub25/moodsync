// Predefined mood context tags
export const MOOD_TAGS = [
  { id: 'work', label: '#arbeit', emoji: '💼' },
  { id: 'relationship', label: '#beziehung', emoji: '❤️' },
  { id: 'health', label: '#gesundheit', emoji: '🏥' },
  { id: 'sleep', label: '#schlaf', emoji: '😴' },
  { id: 'exercise', label: '#sport', emoji: '🏃' },
  { id: 'social', label: '#sozial', emoji: '👥' },
  { id: 'stress', label: '#stress', emoji: '😰' },
  { id: 'success', label: '#erfolg', emoji: '🏆' },
  { id: 'family', label: '#familie', emoji: '👨‍👩‍👧' },
  { id: 'money', label: '#geld', emoji: '💰' },
  { id: 'creative', label: '#kreativ', emoji: '🎨' },
  { id: 'nature', label: '#natur', emoji: '🌳' },
] as const;

export type MoodTagId = typeof MOOD_TAGS[number]['id'];

// Mood emojis with sentiment scores
export const MOOD_EMOJIS = [
  { emoji: '🤩', label: 'Fantastisch', score: 1.0 },
  { emoji: '😊', label: 'Gut', score: 0.8 },
  { emoji: '🙂', label: 'Okay', score: 0.6 },
  { emoji: '😐', label: 'Neutral', score: 0.5 },
  { emoji: '😕', label: 'Meh', score: 0.4 },
  { emoji: '😢', label: 'Traurig', score: 0.2 },
  { emoji: '😤', label: 'Frustriert', score: 0.3 },
  { emoji: '😰', label: 'Ängstlich', score: 0.2 },
] as const;

export type MoodEmoji = typeof MOOD_EMOJIS[number]['emoji'];
