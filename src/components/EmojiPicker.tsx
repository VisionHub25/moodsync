import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MOOD_EMOJIS, MoodEmoji } from '../constants/tags';

interface EmojiPickerProps {
  selected: MoodEmoji | null;
  onSelect: (emoji: MoodEmoji, score: number) => void;
}

export function EmojiPicker({ selected, onSelect }: EmojiPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wie fühlst du dich?</Text>
      <View style={styles.grid}>
        {MOOD_EMOJIS.map(({ emoji, label, score }) => (
          <TouchableOpacity
            key={emoji}
            style={[
              styles.emojiButton,
              selected === emoji && styles.emojiButtonSelected,
            ]}
            onPress={() => onSelect(emoji, score)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.label}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1a1a2e',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  emojiButton: {
    width: 80,
    height: 90,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonSelected: {
    borderColor: '#7c3aed',
    backgroundColor: '#ede9fe',
  },
  emoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
});
