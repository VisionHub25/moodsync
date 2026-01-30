import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MOOD_TAGS } from '../constants/tags';

interface TagCorrelation {
  tag: string;
  avgScore: number;
  count: number;
}

interface TagInsightsProps {
  correlations: TagCorrelation[];
}

export function TagInsights({ correlations }: TagInsightsProps) {
  if (correlations.length === 0) {
    return null;
  }

  // Get top 3 positive and negative tags
  const sortedTags = [...correlations].sort((a, b) => b.avgScore - a.avgScore);
  const positiveTags = sortedTags.filter(t => t.avgScore >= 0.6).slice(0, 3);
  const negativeTags = sortedTags.filter(t => t.avgScore < 0.5).slice(-3).reverse();

  const getTagInfo = (tagId: string) => {
    return MOOD_TAGS.find(t => t.id === tagId) || { label: tagId, emoji: '🏷️' };
  };

  const formatScore = (score: number) => {
    if (score >= 0.7) return { text: 'hebt deine Stimmung', color: '#22c55e' };
    if (score >= 0.5) return { text: 'neutral', color: '#f59e0b' };
    return { text: 'drückt deine Stimmung', color: '#ef4444' };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Was beeinflusst dich?</Text>
      
      {positiveTags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Gute Einflüsse</Text>
          {positiveTags.map(({ tag, avgScore, count }) => {
            const tagInfo = getTagInfo(tag);
            const scoreInfo = formatScore(avgScore);
            return (
              <View key={tag} style={styles.tagRow}>
                <Text style={styles.tagEmoji}>{tagInfo.emoji}</Text>
                <View style={styles.tagContent}>
                  <Text style={styles.tagLabel}>{tagInfo.label}</Text>
                  <Text style={[styles.tagEffect, { color: scoreInfo.color }]}>
                    {scoreInfo.text} ({count}x)
                  </Text>
                </View>
                <View style={[styles.scoreBar, { backgroundColor: scoreInfo.color }]}>
                  <Text style={styles.scoreText}>{(avgScore * 10).toFixed(1)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {negativeTags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Herausforderungen</Text>
          {negativeTags.map(({ tag, avgScore, count }) => {
            const tagInfo = getTagInfo(tag);
            const scoreInfo = formatScore(avgScore);
            return (
              <View key={tag} style={styles.tagRow}>
                <Text style={styles.tagEmoji}>{tagInfo.emoji}</Text>
                <View style={styles.tagContent}>
                  <Text style={styles.tagLabel}>{tagInfo.label}</Text>
                  <Text style={[styles.tagEffect, { color: scoreInfo.color }]}>
                    {scoreInfo.text} ({count}x)
                  </Text>
                </View>
                <View style={[styles.scoreBar, { backgroundColor: scoreInfo.color }]}>
                  <Text style={styles.scoreText}>{(avgScore * 10).toFixed(1)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {positiveTags.length === 0 && negativeTags.length === 0 && (
        <Text style={styles.noData}>
          Nutze mehr Tags bei deinen Check-ins,{'\n'}um Muster zu entdecken! 🏷️
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  tagEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  tagContent: {
    flex: 1,
  },
  tagLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a2e',
  },
  tagEffect: {
    fontSize: 12,
    marginTop: 2,
  },
  scoreBar: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noData: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    paddingVertical: 16,
  },
});
