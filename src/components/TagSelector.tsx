import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MOOD_TAGS, MoodTagId } from '../constants/tags';

interface TagSelectorProps {
  selected: MoodTagId[];
  onToggle: (tagId: MoodTagId) => void;
}

export function TagSelector({ selected, onToggle }: TagSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Was beeinflusst dich heute?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MOOD_TAGS.map(({ id, label, emoji }) => {
          const isSelected = selected.includes(id);
          return (
            <TouchableOpacity
              key={id}
              style={[styles.tag, isSelected && styles.tagSelected]}
              onPress={() => onToggle(id)}
              activeOpacity={0.7}
            >
              <Text style={styles.tagEmoji}>{emoji}</Text>
              <Text style={[styles.tagLabel, isSelected && styles.tagLabelSelected]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 16,
    color: '#1a1a2e',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    marginRight: 8,
  },
  tagSelected: {
    backgroundColor: '#ede9fe',
    borderColor: '#7c3aed',
  },
  tagEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  tagLabel: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  tagLabelSelected: {
    color: '#7c3aed',
  },
});
